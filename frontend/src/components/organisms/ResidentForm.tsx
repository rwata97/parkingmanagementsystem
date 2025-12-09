import { useState } from "react";
import { Button } from "@/components/atoms";
import { TextField, SelectField, Fieldset } from "@/components/molecules";

type Resident = {
  name: string;
  email: string;
  vehicleType: "car" | "motorcycle" | "none";
  plate?: string;
};

type Props = {
  initial?: Partial<Resident>;
  onSubmit: (data: Resident) => void;
  submitting?: boolean;
};

const VEHICLE_OPTS = [
  { value: "car", label: "Car" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "none", label: "None" },
];

export function ResidentForm({ initial, onSubmit, submitting }: Props) {
  const [form, setForm] = useState<Resident>({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    vehicleType: (initial?.vehicleType as Resident["vehicleType"]) ?? "car",
    plate: initial?.plate ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const change = (k: keyof Resident, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const eMap: Record<string, string> = {};
    if (!form.name.trim()) eMap.name = "Name is required";
    if (!form.email.trim()) eMap.email = "Email is required";
    if (form.vehicleType !== "none" && !form.plate?.trim())
      eMap.plate = "Plate required";
    setErrors(eMap);
    if (Object.keys(eMap).length) return;
    onSubmit(form);
  };

  return (
    <form className="space-y-5" onSubmit={submit} noValidate>
      <Fieldset legend="Resident">
        <TextField
          id="name"
          label="Name"
          required
          value={form.name}
          onChange={(e) => change("name", e.target.value)}
          error={errors.name}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => change("email", e.target.value)}
          error={errors.email}
        />
      </Fieldset>

      <Fieldset
        legend="Vehicle"
        description="Provide details only if the resident owns a vehicle."
      >
        <SelectField
          id="vehicleType"
          label="Vehicle Type"
          value={form.vehicleType}
          onChange={(e) => change("vehicleType", e.target.value)}
          options={VEHICLE_OPTS}
        />
        {form.vehicleType !== "none" && (
          <TextField
            id="plate"
            label="License Plate"
            value={form.plate}
            onChange={(e) => change("plate", e.target.value)}
            error={errors.plate}
          />
        )}
      </Fieldset>

      <div className="flex justify-end gap-2">
        <Button type="submit" isLoading={submitting}>
          Save
        </Button>
      </div>
    </form>
  );
}
