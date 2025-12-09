import { Text } from "@/components/atoms";

export function HeaderBar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚗</span>
          <Text as="span" className="text-base font-semibold text-gray-900">
            Community Parking System
          </Text>
        </div>
        <Text className="text-sm text-gray-600">v1.0</Text>
      </div>
    </header>
  );
}
