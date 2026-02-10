import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getApiConfig, saveApiConfig } from "@/lib/api-config";
import { toast } from "@/hooks/use-toast";
import { Save, Eye, EyeOff } from "lucide-react";

const SettingsPage = () => {
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const config = getApiConfig();
    setBaseUrl(config.baseUrl);
    setApiKey(config.apiKey);
  }, []);

  const handleSave = () => {
    if (!baseUrl.trim()) {
      toast({ title: "Base URL is required", variant: "destructive" });
      return;
    }
    saveApiConfig({ baseUrl: baseUrl.trim(), apiKey: apiKey.trim() });
    toast({ title: "Settings saved successfully" });
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">API Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your API base URL and authentication key.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-5 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input
            id="baseUrl"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://your-domain.com/api/v1"
            className="font-mono text-sm bg-secondary/30 border-border"
          />
          <p className="text-xs text-muted-foreground">
            The base URL of your shipment API (e.g. https://example.com/api/v1)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_live_..."
              className="font-mono text-sm bg-secondary/30 border-border pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your X-API-Key header value (format: sk_live_... or sk_test_...)
          </p>
        </div>

        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
