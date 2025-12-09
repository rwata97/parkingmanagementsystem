import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Routes } from "@/Routes";
import { Button, Heading, Text } from "@/components/atoms";
import { TextField } from "@/components/molecules";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
  const { user, login } = useAuth(); // <-- also grab user from context
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (!email.trim()) return setError("Email is required");
    if (!password.trim()) return setError("Password is required");

    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    if (user.role === "ADMIN") {
      nav(Routes.Admin, { replace: true });
    } else if (user.role === "RESIDENT") {
      nav(Routes.Home, { replace: true });
    } else {
      nav(Routes.Home, { replace: true });
    }
  }, [user, nav]);

  return (
    <div className="flex min-h-screen  min-w-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow">
        <Heading level={2} className="mb-1">
          Community Parking System
        </Heading>
        <Text className="mb-6 text-gray-600">Sign in to continue</Text>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <TextField
            id="email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button
            className="w-full"
            isLoading={loading}
            type="submit"
            disabled={loading}
          >
            Login
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href={Routes.Register} className="underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
