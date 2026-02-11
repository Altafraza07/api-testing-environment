import { useState } from "react";
import { RequestBar } from "../components/api-tester/RequestBar";
import { RequestConfig } from "../components/api-tester/RequestConfig";
import { ResponseViewer } from "../components/api-tester/ResponseViewer";
import {
  KeyValuePair,
  ApiResponse,
  HttpMethod,
} from "../components/api-tester/types";
import { Zap } from "lucide-react";
import { toast } from "../hooks/use-toast";

const Index = () => {
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("");
  const [params, setParams] = useState<KeyValuePair[]>([]);
  const [headers, setHeaders] = useState<KeyValuePair[]>([]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    if (!url.trim()) {
      toast({ title: "Please enter a URL", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      // Build URL with query params
      let finalUrl: URL;
      try {
        finalUrl = new URL(url);
      } catch {
        toast({
          title: "Invalid URL",
          description: "Make sure the URL includes the protocol (https://)",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      params
        .filter((p) => p.enabled && p.key)
        .forEach((p) => finalUrl.searchParams.set(p.key, p.value));

      // Build headers
      const reqHeaders: Record<string, string> = {};
      headers
        .filter((h) => h.enabled && h.key)
        .forEach((h) => {
          reqHeaders[h.key] = h.value;
        });

      const fetchOptions: RequestInit = {
        method,
        headers: reqHeaders,
      };

      // Attach body for methods that support it
      if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
        fetchOptions.body = body;
        if (!reqHeaders["Content-Type"]) {
          reqHeaders["Content-Type"] = "application/json";
        }
      }

      const startTime = performance.now();
      const res = await fetch(finalUrl.toString(), fetchOptions);
      const endTime = performance.now();

      const responseBody = await res.text();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: Math.round(endTime - startTime),
        size: new Blob([responseBody]).size,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Request failed";

      // Provide helpful hints for common errors
      const isCors =
        message.includes("Failed to fetch") ||
        message.includes("NetworkError");
      const hint = isCors
        ? "This is likely a CORS error. The target API may not allow browser requests. Try an API that supports CORS, or test with a public API like https://jsonplaceholder.typicode.com/posts"
        : "";

      setResponse({
        status: 0,
        statusText: "Network Error",
        headers: {},
        body: [message, hint].filter(Boolean).join("\n\n"),
        time: 0,
        size: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            API Tester
          </h1>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            v1.0
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        {/* Request bar */}
        <RequestBar
          method={method}
          url={url}
          loading={loading}
          onMethodChange={setMethod}
          onUrlChange={setUrl}
          onSend={sendRequest}
        />

        {/* Request config */}
        <div className="bg-card rounded-lg border border-border p-4">
          <RequestConfig
            params={params}
            headers={headers}
            body={body}
            onParamsChange={setParams}
            onHeadersChange={setHeaders}
            onBodyChange={setBody}
          />
        </div>

        {/* Response viewer */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Response
            </h2>
            {response && response.status > 0 && (
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            )}
          </div>
          <ResponseViewer response={response} loading={loading} />
        </div>
      </main>
    </div>
  );
};

export default Index;
