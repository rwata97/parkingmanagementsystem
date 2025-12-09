import { Button, Text } from "@/components/atoms";
import { useAuth } from "@/components/auth/AuthProvider";

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sticky top-24 h-[calc(100vh-7rem)] w-64 shrink-0 overflow-auto rounded-2xl border bg-white p-4">
      <div className="mt-6 rounded-xl bg-gray-50 p-3">
        <Text className="text-xs text-gray-500">
          Tip: Raffles run every 3 months. Make sure residents are registered
          before running one.
        </Text>
        <Button className="mt-3 w-full" onClick={() => logout()}>
          Sign out
        </Button>
      </div>
    </aside>
  );
}
