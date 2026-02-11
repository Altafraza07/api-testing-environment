import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/api-config";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Loader2,
  MapPin,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  User,
  Phone,
  Mail,
} from "lucide-react";

interface TrackingEvent {
  eventCode: string;
  status: string;
  description: string;
  location: string;
  date: string;
  time: string;
  timestamp: string;
}

interface TrackingData {
  awbNo: string;
  status: string;
  statusDescription: string;
  trackingHistory: TrackingEvent[];
  currentLocation: {
    location: string;
    city: string;
    state: string;
    timestamp: string;
  };
  origin: { city: string; state: string };
  destination: { city: string; state: string };
  shipmentDetails: {
    weight: number | null;
    weightUnit: string;
    packageCount: number;
    serviceType: string | null;
    paymentMode: string | null;
    declaredValue: number | null;
  } | null;
  sender: { name: string; contact: string; address: string } | null;
  receiver: { name: string; contact: string; address: string } | null;
  estimatedDelivery: string;
  totalEvents: number;
}

const STATUS_STYLES: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  DELIVERED: { color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
  IN_TRANSIT: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Truck },
  OUT_FOR_DELIVERY: { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Truck },
  CANCELLED: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  ON_HOLD: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertTriangle },
  DELAYED: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: Clock },
};

const TrackShipment = () => {
  const [awb, setAwb] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackingData | null>(null);

  const handleTrack = async () => {
    const trimmed = awb.trim();
    if (!trimmed) {
      toast({ title: "Please enter an AWB number", variant: "destructive" });
      return;
    }

    setLoading(true);
    setData(null);

    try {
      const res = await apiRequest(`/track?awb=${encodeURIComponent(trimmed)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast({
          title: json.error || "Tracking failed",
          description: json.message,
          variant: "destructive",
        });
        return;
      }

      setData(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = data ? STATUS_STYLES[data.status] || STATUS_STYLES.IN_TRANSIT : null;
  const StatusIcon = statusStyle?.icon || Package;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Track Shipment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter an AWB number to view real-time tracking details.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          value={awb}
          onChange={(e) => setAwb(e.target.value)}
          placeholder="e.g. MPL9022028"
          className="font-mono text-sm bg-secondary/30 border-border"
          onKeyDown={(e) => e.key === "Enter" && handleTrack()}
        />
        <Button onClick={handleTrack} disabled={loading} className="gap-2 min-w-[110px]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Track
        </Button>
      </div>

      {data && (
        <div className="space-y-5 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
          {/* Status banner */}
          <Card className="p-5 border-border">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-mono">AWB</p>
                <p className="text-base font-semibold font-mono text-foreground">{data.awbNo}</p>
              </div>
              <Badge variant="outline" className={`gap-1.5 px-3 py-1 text-xs font-medium ${statusStyle?.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {data.status?.replace(/_/g, " ")}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-3">{data.statusDescription}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-sm">
              {data.origin?.city && (
                <div>
                  <p className="text-xs text-muted-foreground">Origin</p>
                  <p className="text-foreground">{[data.origin.city, data.origin.state].filter(Boolean).join(", ")}</p>
                </div>
              )}
              {data.destination?.city && (
                <div>
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="text-foreground">{[data.destination.city, data.destination.state].filter(Boolean).join(", ")}</p>
                </div>
              )}
              {data.estimatedDelivery && (
                <div>
                  <p className="text-xs text-muted-foreground">Est. Delivery</p>
                  <p className="text-foreground">{new Date(data.estimatedDelivery).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Sender / Receiver */}
          {(data.sender || data.receiver) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {data.sender && (
                <Card className="p-4 border-border space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sender</p>
                  {data.sender.name && <p className="text-sm text-foreground flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" />{data.sender.name}</p>}
                  {data.sender.contact && <p className="text-sm text-foreground flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{data.sender.contact}</p>}
                  {data.sender.address && <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{data.sender.address}</p>}
                </Card>
              )}
              {data.receiver && (
                <Card className="p-4 border-border space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Receiver</p>
                  {data.receiver.name && <p className="text-sm text-foreground flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" />{data.receiver.name}</p>}
                  {data.receiver.contact && <p className="text-sm text-foreground flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{data.receiver.contact}</p>}
                  {data.receiver.address && <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{data.receiver.address}</p>}
                </Card>
              )}
            </div>
          )}

          {/* Timeline */}
          {data.trackingHistory.length > 0 && (
            <Card className="p-5 border-border">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                Tracking History ({data.totalEvents} events)
              </p>
              <div className="relative pl-6 space-y-5">
                <div className="absolute left-[9px] top-1 bottom-1 w-px bg-border" />
                {data.trackingHistory.map((evt, i) => {
                  const isLatest = i === data.trackingHistory.length - 1;
                  return (
                  <div key={i} className="relative">
                    <div className={`absolute -left-6 top-0.5 h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center ${isLatest ? "bg-primary border-primary" : "bg-card border-muted-foreground/30"}`}>
                      {isLatest && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                      {!isLatest && <CheckCircle2 className="h-3 w-3 text-muted-foreground/50" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isLatest ? "text-foreground" : "text-muted-foreground"}`}>{evt.status || evt.eventCode}</p>
                      <p className="text-xs text-muted-foreground">{evt.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {evt.location && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{evt.location}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackShipment;
