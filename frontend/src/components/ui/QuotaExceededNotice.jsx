import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { GlassCard } from "./GlassCard";

export function QuotaExceededNotice({ message }) {
  return (
    <GlassCard className="border-gold/30 bg-gold-soft/40">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-gold" />
        <div className="flex-1">
          <p className="mb-1 text-sm font-medium text-main">Monthly limit reached</p>
          <p className="mb-3 text-sm text-muted">{message}</p>
          <Link to="/billing">
            <Button size="sm">View plans</Button>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}

export default QuotaExceededNotice;
