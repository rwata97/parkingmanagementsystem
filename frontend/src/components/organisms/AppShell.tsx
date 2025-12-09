import { Sidebar } from "@/components/molecules";
import { HeaderBar } from "./HeaderBar";
import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function AppShell({ children, className }: Props) {
  return (
    <div className="min-h-screen min-w-screen bg-gray-50">
      <HeaderBar />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6">
        <Sidebar />
        <main className={cn("flex-1 space-y-6", className)}>{children}</main>
      </div>
    </div>
  );
}
