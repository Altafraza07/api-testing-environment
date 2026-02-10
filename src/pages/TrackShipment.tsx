import { Search } from "lucide-react";

const TrackShipment = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
      <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
        <Search className="h-6 w-6 opacity-40" />
      </div>
      <p className="text-sm">Track Shipment — Coming soon</p>
    </div>
  );
};

export default TrackShipment;
