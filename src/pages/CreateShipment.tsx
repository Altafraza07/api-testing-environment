import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/api-config";
import { toast } from "@/hooks/use-toast";
import { Loader2, Package, CheckCircle2, Copy } from "lucide-react";

interface ShipmentResult {
  awbNo: string;
  status: string;
  isHold: boolean;
  holdReason?: string;
  totalAmount: number;
}

const CreateShipment = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShipmentResult | null>(null);

  // Form state
  const [form, setForm] = useState({
    destination: "",
    sector: "",
    payment: "Prepaid",
    origin: "",
    reference: "",
    service: "",
    goodstype: "",
    content: "",
    pcs: "",
    totalActualWt: "",
    chargeableWt: "",
    totalVolWt: "",
    totalInvoiceValue: "",
    basicAmt: "",
    cgst: "",
    sgst: "",
    igst: "",
    grandTotal: "",
    operationRemark: "",
    // Receiver
    receiverFullName: "",
    receiverPhoneNumber: "",
    receiverEmail: "",
    receiverAddressLine1: "",
    receiverAddressLine2: "",
    receiverCity: "",
    receiverState: "",
    receiverPincode: "",
    // Shipper
    shipperFullName: "",
    shipperPhoneNumber: "",
    shipperEmail: "",
    shipperAddressLine1: "",
    shipperAddressLine2: "",
    shipperCity: "",
    shipperState: "",
    shipperPincode: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.destination || !form.sector || !form.payment) {
      toast({
        title: "Missing required fields",
        description: "Destination, Sector, and Payment are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await apiRequest("/shipments", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          pcs: Number(form.pcs) || 0,
          totalActualWt: Number(form.totalActualWt) || 0,
          chargeableWt: Number(form.chargeableWt) || 0,
          totalVolWt: Number(form.totalVolWt) || 0,
          totalInvoiceValue: Number(form.totalInvoiceValue) || 0,
          basicAmt: Number(form.basicAmt) || 0,
          cgst: Number(form.cgst) || 0,
          sgst: Number(form.sgst) || 0,
          igst: Number(form.igst) || 0,
          grandTotal: Number(form.grandTotal) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          title: data.error || "Failed to create shipment",
          description: data.message || `Status: ${res.status}`,
          variant: "destructive",
        });
        return;
      }

      setResult(data.data);
      toast({ title: "Shipment created successfully!" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyAwb = () => {
    if (result?.awbNo) {
      navigator.clipboard.writeText(result.awbNo);
      toast({ title: "AWB copied to clipboard" });
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Create Shipment
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details below and submit to create a new shipment via your API.
        </p>
      </div>

      {/* Success result */}
      {result && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <CheckCircle2 className="h-4 w-4" />
            Shipment Created
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-foreground">{result.awbNo}</span>
            <button onClick={copyAwb} className="text-muted-foreground hover:text-foreground">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs text-muted-foreground space-x-4">
            <span>Status: {result.status}</span>
            <span>Amount: ₹{result.totalAmount}</span>
            {result.isHold && <span className="text-destructive">ON HOLD: {result.holdReason}</span>}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required fields */}
        <Section title="Basic Info (Required)">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Destination *" value={form.destination} onChange={(v) => update("destination", v)} placeholder="City or code" />
            <Field label="Sector *" value={form.sector} onChange={(v) => update("sector", v)} placeholder="e.g. DOM, INTL" />
            <div className="space-y-2">
              <Label className="text-xs">Payment *</Label>
              <Select value={form.payment} onValueChange={(v) => update("payment", v)}>
                <SelectTrigger className="bg-secondary/30 border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prepaid">Prepaid</SelectItem>
                  <SelectItem value="COD">COD</SelectItem>
                  <SelectItem value="To Pay">To Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Origin" value={form.origin} onChange={(v) => update("origin", v)} placeholder="Origin city" />
            <Field label="Reference" value={form.reference} onChange={(v) => update("reference", v)} placeholder="Your reference code" />
            <Field label="Service" value={form.service} onChange={(v) => update("service", v)} placeholder="e.g. Express" />
          </div>
        </Section>

        {/* Package details */}
        <Section title="Package Details">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Pieces" value={form.pcs} onChange={(v) => update("pcs", v)} placeholder="0" type="number" />
            <Field label="Actual Weight (kg)" value={form.totalActualWt} onChange={(v) => update("totalActualWt", v)} placeholder="0" type="number" />
            <Field label="Vol. Weight (kg)" value={form.totalVolWt} onChange={(v) => update("totalVolWt", v)} placeholder="0" type="number" />
            <Field label="Chargeable Wt (kg)" value={form.chargeableWt} onChange={(v) => update("chargeableWt", v)} placeholder="0" type="number" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Goods Type" value={form.goodstype} onChange={(v) => update("goodstype", v)} placeholder="e.g. Electronics" />
            <Field label="Invoice Value" value={form.totalInvoiceValue} onChange={(v) => update("totalInvoiceValue", v)} placeholder="0" type="number" />
            <Field label="Content" value={form.content} onChange={(v) => update("content", v)} placeholder="Package content" />
          </div>
        </Section>

        {/* Billing */}
        <Section title="Billing">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Field label="Basic Amt" value={form.basicAmt} onChange={(v) => update("basicAmt", v)} placeholder="0" type="number" />
            <Field label="CGST" value={form.cgst} onChange={(v) => update("cgst", v)} placeholder="0" type="number" />
            <Field label="SGST" value={form.sgst} onChange={(v) => update("sgst", v)} placeholder="0" type="number" />
            <Field label="IGST" value={form.igst} onChange={(v) => update("igst", v)} placeholder="0" type="number" />
            <Field label="Grand Total" value={form.grandTotal} onChange={(v) => update("grandTotal", v)} placeholder="0" type="number" />
          </div>
        </Section>

        {/* Receiver */}
        <Section title="Receiver Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" value={form.receiverFullName} onChange={(v) => update("receiverFullName", v)} placeholder="Receiver name" />
            <Field label="Phone" value={form.receiverPhoneNumber} onChange={(v) => update("receiverPhoneNumber", v)} placeholder="Phone number" />
          </div>
          <Field label="Email" value={form.receiverEmail} onChange={(v) => update("receiverEmail", v)} placeholder="Email address" />
          <Field label="Address Line 1" value={form.receiverAddressLine1} onChange={(v) => update("receiverAddressLine1", v)} placeholder="Street address" />
          <Field label="Address Line 2" value={form.receiverAddressLine2} onChange={(v) => update("receiverAddressLine2", v)} placeholder="Apt, suite, etc." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City" value={form.receiverCity} onChange={(v) => update("receiverCity", v)} placeholder="City" />
            <Field label="State" value={form.receiverState} onChange={(v) => update("receiverState", v)} placeholder="State" />
            <Field label="Pincode" value={form.receiverPincode} onChange={(v) => update("receiverPincode", v)} placeholder="Pincode" />
          </div>
        </Section>

        {/* Shipper */}
        <Section title="Shipper Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" value={form.shipperFullName} onChange={(v) => update("shipperFullName", v)} placeholder="Shipper name" />
            <Field label="Phone" value={form.shipperPhoneNumber} onChange={(v) => update("shipperPhoneNumber", v)} placeholder="Phone number" />
          </div>
          <Field label="Email" value={form.shipperEmail} onChange={(v) => update("shipperEmail", v)} placeholder="Email address" />
          <Field label="Address Line 1" value={form.shipperAddressLine1} onChange={(v) => update("shipperAddressLine1", v)} placeholder="Street address" />
          <Field label="Address Line 2" value={form.shipperAddressLine2} onChange={(v) => update("shipperAddressLine2", v)} placeholder="Apt, suite, etc." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City" value={form.shipperCity} onChange={(v) => update("shipperCity", v)} placeholder="City" />
            <Field label="State" value={form.shipperState} onChange={(v) => update("shipperState", v)} placeholder="State" />
            <Field label="Pincode" value={form.shipperPincode} onChange={(v) => update("shipperPincode", v)} placeholder="Pincode" />
          </div>
        </Section>

        {/* Remarks */}
        <Section title="Remarks">
          <Textarea
            value={form.operationRemark}
            onChange={(e) => update("operationRemark", e.target.value)}
            placeholder="Any additional remarks..."
            className="bg-secondary/30 border-border text-sm min-h-[80px]"
          />
        </Section>

        <Button type="submit" disabled={loading} className="gap-2 w-full sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
          {loading ? "Creating..." : "Create Shipment"}
        </Button>
      </form>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-secondary/30 border-border text-sm"
      />
    </div>
  );
}

export default CreateShipment;
