import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HTTP_METHODS, HttpMethod, METHOD_COLORS } from "./types";

interface RequestBarProps {
  method: HttpMethod;
  url: string;
  loading: boolean;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
}

export const RequestBar = ({
  method,
  url,
  loading,
  onMethodChange,
  onUrlChange,
  onSend,
}: RequestBarProps) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
      <Select value={method} onValueChange={(v) => onMethodChange(v as HttpMethod)}>
        <SelectTrigger
          className={cn(
            "w-[130px] font-mono font-bold text-sm border-border bg-secondary/50",
            METHOD_COLORS[method]
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HTTP_METHODS.map((m) => (
            <SelectItem key={m} value={m}>
              <span className={cn("font-mono font-bold", METHOD_COLORS[m])}>
                {m}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://api.example.com/endpoint"
        className="flex-1 font-mono text-sm bg-secondary/50 border-border placeholder:text-muted-foreground/50"
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />

      <Button
        onClick={onSend}
        disabled={loading || !url.trim()}
        className="gap-2 min-w-[100px] font-medium"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Send
      </Button>
    </div>
  );
};
