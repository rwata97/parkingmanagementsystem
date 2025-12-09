import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Routes } from "@/Routes";
import { Button, Heading, Text } from "@/components/atoms";
import { TextField } from "@/components/molecules";
import { useAuth } from "@/components/auth/AuthProvider";

type Role = "ADMIN" | "RESIDENT";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [vehicleType, setVehicleType] = useState<
    "CAR" | "MOTORCYCLE" | "BICYCLE" | "NONE"
  >("NONE");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (!name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    if (password.length < 6)
      return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");
    if (vehicleType !== "NONE" && !vehiclePlate.trim())
      return setError("License plate is required for selected vehicle type");

    const vehicle =
      vehicleType === "NONE"
        ? undefined
        : { type: vehicleType.toLowerCase(), plate: vehiclePlate.trim() }; // e.g. { type: 'car', plate: 'ABC123' }

    setLoading(true);
    try {
      const res = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        vehicle, // can be undefined
      });
      const role = (res?.role as Role | undefined) ?? "RESIDENT";
      nav(role === "ADMIN" ? Routes.Admin : Routes.Home, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow">
        <Heading level={2} className="mb-1">
          Community Parking System
        </Heading>
        <Text className="mb-6 text-gray-600">Create your account</Text>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <TextField
            id="name"
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <TextField
            id="email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          {/* Vehicle Info */}
          <div>
            <label
              className="block text-sm font-medium mb-1 text-gray-600"
              htmlFor="vehicleType"
            >
              Vehicle Type
            </label>
            <select
              id="vehicleType"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as any)}
              className="w-full rounded-md border px-3 py-2 text-gray-600"
            >
              <option value="CAR">Car</option>
              <option value="MOTORCYCLE">Motorcycle</option>
              <option value="BICYCLE">Bicycle</option>
              <option value="NONE">None</option>
            </select>
          </div>

          {vehicleType !== "NONE" && (
            <TextField
              id="vehiclePlate"
              label="License Plate"
              required
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              autoComplete="off"
            />
          )}

          <TextField
            id="password"
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <TextField
            id="confirm"
            label="Confirm Password"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            className="w-full"
            isLoading={loading}
            type="submit"
            disabled={loading}
          >
            Register
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href={Routes.Login} className="underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
