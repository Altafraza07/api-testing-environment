import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { apiRequest } from "../lib/api-config";
import { toast } from "../hooks/use-toast";
import { Loader2, Package, CheckCircle2, Copy, AlertCircle } from "lucide-react";

interface ShipmentResult {
  awbNo: string;
  status: string;
  isHold: boolean;
  holdReason?: string;
  totalAmount: number;
  createdAt: string;
  trackingUrl: string;
}

const CreateShipment = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShipmentResult | null>(null);

  // Form state with sector now included
  const [form, setForm] = useState({
    destination: "",
    sector: "", // REQUIRED
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
    
    // Validate required fields
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
          destination: form.destination,
          sector: form.sector, // REQUIRED
          payment: form.payment,
          origin: form.origin || undefined,
          reference: form.reference || undefined,
          service: form.service || undefined,
          goodstype: form.goodstype || undefined,
          content: form.content || undefined,
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
          operationRemark: form.operationRemark || undefined,
          // Receiver (only send if provided)
          receiverFullName: form.receiverFullName || undefined,
          receiverPhoneNumber: form.receiverPhoneNumber || undefined,
          receiverEmail: form.receiverEmail || undefined,
          receiverAddressLine1: form.receiverAddressLine1 || undefined,
          receiverAddressLine2: form.receiverAddressLine2 || undefined,
          receiverCity: form.receiverCity || undefined,
          receiverState: form.receiverState || undefined,
          receiverPincode: form.receiverPincode || undefined,
          // Shipper (only send if provided)
          shipperFullName: form.shipperFullName || undefined,
          shipperPhoneNumber: form.shipperPhoneNumber || undefined,
          shipperEmail: form.shipperEmail || undefined,
          shipperAddressLine1: form.shipperAddressLine1 || undefined,
          shipperAddressLine2: form.shipperAddressLine2 || undefined,
          shipperCity: form.shipperCity || undefined,
          shipperState: form.shipperState || undefined,
          shipperPincode: form.shipperPincode || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Show detailed error
        const errorMessage = data.message || data.error || "Failed to create shipment";
        const errorDetails = data.details || data.fields?.join(", ") || "";
        
        toast({
          title: errorMessage,
          description: errorDetails ? `Details: ${errorDetails}` : `Status: ${res.status}`,
          variant: "destructive",
        });
        return;
      }

      setResult(data.data);
      
      // Show success with hold warning if applicable
      if (data.data.isHold) {
        toast({ 
          title: "Shipment created (ON HOLD)", 
          description: data.data.holdReason || "Credit limit exceeded",
          variant: "default"
        });
      } else {
        toast({ title: "Shipment created successfully!" });
      }
      
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed";
      toast({ 
        title: "Error", 
        description: message, 
        variant: "destructive" 
      });
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

  const resetForm = () => {
    setForm({
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
      receiverFullName: "",
      receiverPhoneNumber: "",
      receiverEmail: "",
      receiverAddressLine1: "",
      receiverAddressLine2: "",
      receiverCity: "",
      receiverState: "",
      receiverPincode: "",
      shipperFullName: "",
      shipperPhoneNumber: "",
      shipperEmail: "",
      shipperAddressLine1: "",
      shipperAddressLine2: "",
      shipperCity: "",
      shipperState: "",
      shipperPincode: "",
    });
    setResult(null);
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
        <div className={`${result.isHold ? 'bg-yellow-50 border-yellow-200' : 'bg-primary/5 border-primary/20'} border rounded-lg p-4 space-y-3`}>
          <div className="flex items-center gap-2 font-medium text-sm">
            {result.isHold ? (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-800">Shipment Created (ON HOLD)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-primary">Shipment Created</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-foreground">{result.awbNo}</span>
            <button onClick={copyAwb} className="text-muted-foreground hover:text-foreground">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex flex-wrap gap-4">
              <span>Status: <strong>{result.status}</strong></span>
              <span>Amount: <strong>₹{result.totalAmount}</strong></span>
            </div>
            {result.isHold && (
              <div className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded mt-2">
                <strong>Hold Reason:</strong> {result.holdReason || "Credit Limit Exceeded"}
              </div>
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              Tracking: <code className="bg-gray-100 px-1 rounded">{result.trackingUrl}</code>
            </div>
          </div>
          
          <Button 
            onClick={resetForm} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Create Another Shipment
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required fields */}
        <Section title="Basic Info (Required)">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field 
              label="Destination *" 
              value={form.destination} 
              onChange={(v) => update("destination", v)} 
              placeholder="e.g. Delhi, Mumbai" 
            />
            <div className="space-y-2">
              <Label className="text-xs">Sector *</Label>
              <Select value={form.sector} onValueChange={(v) => update("sector", v)}>
                <SelectTrigger className="bg-secondary/30 border-border text-sm">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Domestic">Domestic</SelectItem>
                  <SelectItem value="International">International</SelectItem>
                  <SelectItem value="DOM">DOM</SelectItem>
                  <SelectItem value="INTL">INTL</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Origin" value={form.origin} onChange={(v) => update("origin", v)} placeholder="Origin city" />
            <Field label="Reference" value={form.reference} onChange={(v) => update("reference", v)} placeholder="Your reference code" />
            <Field label="Service" value={form.service} onChange={(v) => update("service", v)} placeholder="e.g. Express, Standard" />
          </div>
        </Section>

        {/* Package details */}
        <Section title="Package Details">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Pieces" value={form.pcs} onChange={(v) => update("pcs", v)} placeholder="0" type="number" step="1" />
            <Field label="Actual Weight (kg)" value={form.totalActualWt} onChange={(v) => update("totalActualWt", v)} placeholder="0" type="number" step="0.1" />
            <Field label="Vol. Weight (kg)" value={form.totalVolWt} onChange={(v) => update("totalVolWt", v)} placeholder="0" type="number" step="0.1" />
            <Field label="Chargeable Wt (kg)" value={form.chargeableWt} onChange={(v) => update("chargeableWt", v)} placeholder="0" type="number" step="0.1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Goods Type" value={form.goodstype} onChange={(v) => update("goodstype", v)} placeholder="e.g. Electronics, Documents" />
            <Field label="Invoice Value" value={form.totalInvoiceValue} onChange={(v) => update("totalInvoiceValue", v)} placeholder="0" type="number" step="0.01" />
            <Field label="Content" value={form.content} onChange={(v) => update("content", v)} placeholder="Package content description" />
          </div>
        </Section>

        {/* Billing */}
        <Section title="Billing">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Field label="Basic Amt" value={form.basicAmt} onChange={(v) => update("basicAmt", v)} placeholder="0" type="number" step="0.01" />
            <Field label="CGST" value={form.cgst} onChange={(v) => update("cgst", v)} placeholder="0" type="number" step="0.01" />
            <Field label="SGST" value={form.sgst} onChange={(v) => update("sgst", v)} placeholder="0" type="number" step="0.01" />
            <Field label="IGST" value={form.igst} onChange={(v) => update("igst", v)} placeholder="0" type="number" step="0.01" />
            <Field label="Grand Total" value={form.grandTotal} onChange={(v) => update("grandTotal", v)} placeholder="0" type="number" step="0.01" />
          </div>
        </Section>

        {/* Receiver */}
        <Section title="Receiver Details (Optional)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" value={form.receiverFullName} onChange={(v) => update("receiverFullName", v)} placeholder="Receiver name" />
            <Field label="Phone" value={form.receiverPhoneNumber} onChange={(v) => update("receiverPhoneNumber", v)} placeholder="+91 9876543210" />
          </div>
          <Field label="Email" value={form.receiverEmail} onChange={(v) => update("receiverEmail", v)} placeholder="receiver@example.com" type="email" />
          <Field label="Address Line 1" value={form.receiverAddressLine1} onChange={(v) => update("receiverAddressLine1", v)} placeholder="Street address" />
          <Field label="Address Line 2" value={form.receiverAddressLine2} onChange={(v) => update("receiverAddressLine2", v)} placeholder="Apt, suite, etc. (optional)" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City" value={form.receiverCity} onChange={(v) => update("receiverCity", v)} placeholder="City" />
            <Field label="State" value={form.receiverState} onChange={(v) => update("receiverState", v)} placeholder="State" />
            <Field label="Pincode" value={form.receiverPincode} onChange={(v) => update("receiverPincode", v)} placeholder="110001" />
          </div>
        </Section>

        {/* Shipper */}
        <Section title="Shipper Details (Optional)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" value={form.shipperFullName} onChange={(v) => update("shipperFullName", v)} placeholder="Shipper name" />
            <Field label="Phone" value={form.shipperPhoneNumber} onChange={(v) => update("shipperPhoneNumber", v)} placeholder="+91 9123456789" />
          </div>
          <Field label="Email" value={form.shipperEmail} onChange={(v) => update("shipperEmail", v)} placeholder="shipper@example.com" type="email" />
          <Field label="Address Line 1" value={form.shipperAddressLine1} onChange={(v) => update("shipperAddressLine1", v)} placeholder="Street address" />
          <Field label="Address Line 2" value={form.shipperAddressLine2} onChange={(v) => update("shipperAddressLine2", v)} placeholder="Apt, suite, etc. (optional)" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City" value={form.shipperCity} onChange={(v) => update("shipperCity", v)} placeholder="City" />
            <Field label="State" value={form.shipperState} onChange={(v) => update("shipperState", v)} placeholder="State" />
            <Field label="Pincode" value={form.shipperPincode} onChange={(v) => update("shipperPincode", v)} placeholder="400001" />
          </div>
        </Section>

        {/* Remarks */}
        <Section title="Remarks (Optional)">
          <Textarea
            value={form.operationRemark}
            onChange={(e) => update("operationRemark", e.target.value)}
            placeholder="Any additional remarks or special instructions..."
            className="bg-secondary/30 border-border text-sm min-h-[80px]"
          />
        </Section>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
            {loading ? "Creating..." : "Create Shipment"}
          </Button>
          
          {result && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Clear & Create Another
            </Button>
          )}
        </div>
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
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        className="bg-secondary/30 border-border text-sm"
      />
    </div>
  );
}

export default CreateShipment;