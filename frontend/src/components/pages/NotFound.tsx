import { Link } from "react-router-dom";
import { Routes } from "@/Routes";
import { Button, Heading, Text } from "@/components/atoms";
import { useAuth } from "@/components/auth/AuthProvider";

export default function NotFound() {
  const { user } = useAuth();
  const target = !user
    ? Routes.Login
    : user.role === "ADMIN"
    ? Routes.Admin
    : Routes.Home;

  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 text-center shadow">
        <Heading level={2}>404 — Not Found</Heading>
        <Text className="mt-2 text-gray-600">
          The page you’re looking for doesn’t exist.
        </Text>
        <Button className="mt-4">
          <Link to={target}>Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
