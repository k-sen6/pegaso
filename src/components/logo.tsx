import { cn } from "cn";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6 text-primary"
        aria-hidden="true"
      >
        <path d="M12 3c0 2 1.5 3.5 3.5 3.5S19 8 19 10c0 3.5-3 6-7 7-4-1-7-3.5-7-7 0-2 1.5-3.5 3.5-3.5S12 5 12 3z" />
        <path d="M8 16c-1.6 1.6-4 1.9-4 1.9s.7-2.4 1.6-4.1" />
        <path d="M16 16c1.6 1.6 4 1.9 4 1.9s-.7-2.4-1.6-4.1" />
      </svg>
      <span className="font-semibold tracking-tight text-lg">Pegaso</span>
    </span>
  );
}
