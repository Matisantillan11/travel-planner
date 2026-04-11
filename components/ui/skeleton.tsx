import { cn } from "@/lib/utils";

// Skeleton inherits its width/height from the parent or className — never uses
// random/dynamic values to avoid SSR hydration mismatches.
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
