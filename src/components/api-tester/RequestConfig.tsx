import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { KeyValueEditor } from "./KeyValueEditor";
import { KeyValuePair } from "./types";

interface RequestConfigProps {
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
  onParamsChange: (params: KeyValuePair[]) => void;
  onHeadersChange: (headers: KeyValuePair[]) => void;
  onBodyChange: (body: string) => void;
}

export const RequestConfig = ({
  params,
  headers,
  body,
  onParamsChange,
  onHeadersChange,
  onBodyChange,
}: RequestConfigProps) => {
  const activeParams = params.filter((p) => p.enabled && p.key).length;
  const activeHeaders = headers.filter((h) => h.enabled && h.key).length;

  return (
    <Tabs defaultValue="params" className="w-full">
      <TabsList className="bg-muted/50 h-9">
        <TabsTrigger value="params" className="gap-1.5 text-xs data-[state=active]:bg-secondary">
          Params
          {activeParams > 0 && (
            <Badge
              variant="secondary"
              className="h-4.5 min-w-[18px] px-1 text-[10px] font-mono bg-primary/15 text-primary border-0"
            >
              {activeParams}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="headers" className="gap-1.5 text-xs data-[state=active]:bg-secondary">
          Headers
          {activeHeaders > 0 && (
            <Badge
              variant="secondary"
              className="h-4.5 min-w-[18px] px-1 text-[10px] font-mono bg-primary/15 text-primary border-0"
            >
              {activeHeaders}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="body" className="text-xs data-[state=active]:bg-secondary">
          Body
        </TabsTrigger>
      </TabsList>

      <TabsContent value="params" className="mt-4">
        <KeyValueEditor pairs={params} onChange={onParamsChange} />
      </TabsContent>

      <TabsContent value="headers" className="mt-4">
        <KeyValueEditor pairs={headers} onChange={onHeadersChange} />
      </TabsContent>

      <TabsContent value="body" className="mt-4">
        <Textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder='{"key": "value"}'
          className="font-mono text-sm min-h-[160px] resize-y bg-secondary/30 border-border placeholder:text-muted-foreground/40"
        />
      </TabsContent>
    </Tabs>
  );
};
