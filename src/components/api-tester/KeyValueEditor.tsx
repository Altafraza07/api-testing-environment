import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { KeyValuePair } from "./types";

interface KeyValueEditorProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
}

export const KeyValueEditor = ({ pairs, onChange }: KeyValueEditorProps) => {
  const addPair = () => {
    onChange([
      ...pairs,
      { id: crypto.randomUUID(), key: "", value: "", enabled: true },
    ]);
  };

  const updatePair = (
    id: string,
    field: keyof KeyValuePair,
    value: string | boolean
  ) => {
    onChange(pairs.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removePair = (id: string) => {
    onChange(pairs.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-2">
      {pairs.length > 0 && (
        <div className="grid grid-cols-[28px_1fr_1fr_32px] gap-2 px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">
          <span />
          <span>Key</span>
          <span>Value</span>
          <span />
        </div>
      )}

      {pairs.map((pair) => (
        <div
          key={pair.id}
          className="grid grid-cols-[28px_1fr_1fr_32px] gap-2 items-center group"
        >
          <Checkbox
            checked={pair.enabled}
            onCheckedChange={(checked) =>
              updatePair(pair.id, "enabled", !!checked)
            }
            className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Input
            value={pair.key}
            onChange={(e) => updatePair(pair.id, "key", e.target.value)}
            placeholder="Key"
            className="font-mono text-sm h-9 bg-secondary/30 border-border"
          />
          <Input
            value={pair.value}
            onChange={(e) => updatePair(pair.id, "value", e.target.value)}
            placeholder="Value"
            className="font-mono text-sm h-9 bg-secondary/30 border-border"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removePair(pair.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs border-dashed border-muted-foreground/20 text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
        onClick={addPair}
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </Button>
    </div>
  );
};
