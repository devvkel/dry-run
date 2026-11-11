import RefreshCountdown from "@/components/RefreshCountdown";
import { updatedLabel } from "@/lib/token";

/** "Data updated … · next refresh in …" pill. */
export default function DataBadge({ extra, className = "" }: { extra?: string; className?: string }) {
  return (
    <div className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-lime/25 bg-lime/[0.05] px-3 py-1.5 text-[11px] text-[#c9cddb] ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
      </span>
      <span>
        Data updated <b className="font-semibold text-white">{updatedLabel()}</b>
      </span>
      <span className="text-mute">·</span>
      <span>
        next refresh in <b className="font-semibold text-lime"><RefreshCountdown /></b>
      </span>
      {extra && (
        <>
          <span className="text-mute">·</span>
          <span>{extra}</span>
        </>
      )}
    </div>
  );
}
