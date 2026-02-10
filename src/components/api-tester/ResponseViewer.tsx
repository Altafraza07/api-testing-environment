import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Clock, ArrowDownToLine, Zap } from "lucide-react";
import { useState } from "react";
import { ApiResponse } from "./types";
import { cn } from "@/lib/utils";

interface ResponseViewerProps {
  response: ApiResponse | null;
  loading: boolean;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300)
    return "bg-method-get/10 text-method-get border-method-get/25";
  if (status >= 300 && status < 400)
    return "bg-method-put/10 text-method-put border-method-put/25";
  if (status >= 400 && status < 500)
    return "bg-method-delete/10 text-method-delete border-method-delete/25";
  if (status >= 500)
    return "bg-method-delete/10 text-method-delete border-method-delete/25";
  return "bg-muted text-muted-foreground border-border";
};

const formatJson = (text: string): string => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
};

export const ResponseViewer = ({ response, loading }: ResponseViewerProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!response) return;
    await navigator.clipboard.writeText(formatJson(response.body));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Sending request...</span>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
          <Zap className="h-6 w-6 opacity-40" />
        </div>
        <p className="text-sm">Enter a URL and hit Send to get started</p>
      </div>
    );
  }

  const formattedBody = formatJson(response.body);
  const headerEntries = Object.entries(response.headers);

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              "font-mono font-bold text-sm px-2.5 py-1 border",
              getStatusColor(response.status)
            )}
          >
            {response.status === 0 ? "ERR" : response.status}{" "}
            {response.statusText}
          </Badge>

          {response.time > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono">{response.time}ms</span>
            </div>
          )}

          {response.size > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowDownToLine className="h-3.5 w-3.5" />
              <span className="font-mono">{formatBytes(response.size)}</span>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-7 text-muted-foreground hover:text-foreground"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      {/* Body / Headers tabs */}
      <Tabs defaultValue="body">
        <TabsList className="bg-muted/50 h-9">
          <TabsTrigger value="body" className="text-xs data-[state=active]:bg-secondary">
            Body
          </TabsTrigger>
          <TabsTrigger value="headers" className="gap-1.5 text-xs data-[state=active]:bg-secondary">
            Headers
            {headerEntries.length > 0 && (
              <Badge
                variant="secondary"
                className="h-4.5 min-w-[18px] px-1 text-[10px] font-mono bg-primary/15 text-primary border-0"
              >
                {headerEntries.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="mt-3">
          <pre className="bg-muted/30 rounded-lg p-4 text-sm font-mono overflow-auto max-h-[420px] whitespace-pre-wrap break-words border border-border leading-relaxed text-foreground/90">
            {formattedBody}
          </pre>
        </TabsContent>

        <TabsContent value="headers" className="mt-3">
          {headerEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No headers returned
            </p>
          ) : (
            <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
              {headerEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-[minmax(140px,auto)_1fr] gap-4 px-4 py-2.5 border-b border-border/50 last:border-0 text-sm"
                >
                  <span className="font-mono font-medium text-foreground/90 truncate">
                    {key}
                  </span>
                  <span className="font-mono text-muted-foreground break-all">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
