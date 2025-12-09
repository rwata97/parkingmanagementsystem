import { useEffect, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/atoms";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // basic focus management: focus dialog on open
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };

  const content = (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={cn("w-full rounded-2xl bg-white shadow-xl", sizes[size])}
        >
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close"
              onClick={onClose}
            >
              ✕
            </Button>
          </div>
          <div className="px-5 py-4">{children}</div>
          <div className="flex justify-end gap-2 border-t px-5 py-3">
            {footer ?? <Button onClick={onClose}>OK</Button>}
          </div>
        </div>
      </div>
    </div>
  );

  // Optional: use createPortal if you want to portal to body
  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : content;
}
