export function HippocampusStartupStatus({ message }: { message: string }) {
  return (
    <div
      className="flex min-h-dvh flex-1 items-center justify-center bg-[#09090b] px-4 text-sm font-medium text-zinc-300"
      data-hippo-startup-pending
      role="status"
    >
      {message}
    </div>
  );
}
