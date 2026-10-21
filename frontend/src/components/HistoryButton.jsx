import { useState } from "react";
import { History } from "lucide-react";
import { Button } from "./ui/Button";
import { FeatureHistoryModal } from "./history/FeatureHistoryModal";

/**
 * Universal History Button & Modal for Job Genius features.
 * Opens a modal with a scrollable list of past runs sorted by date.
 * Clicking any run displays the exact full result UI (not raw JSON!).
 */
export function HistoryButton({
  title,
  feature,
  fetchHistory,
  onLoadIntoPage,
  className = "",
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        icon={History}
        onClick={() => setOpen(true)}
        className={`shrink-0 self-start text-xs font-semibold ${className}`}
      >
        History
      </Button>

      <FeatureHistoryModal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        feature={feature}
        fetchHistory={fetchHistory}
        onLoadIntoPage={onLoadIntoPage}
      />
    </>
  );
}

export default HistoryButton;
