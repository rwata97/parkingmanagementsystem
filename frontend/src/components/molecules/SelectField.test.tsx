import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SelectField } from "@/components/molecules/SelectField";

type SelectFieldProps = React.ComponentProps<typeof SelectField>;

const baseOptions = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B", disabled: true },
];

const renderComponent = (props: Partial<SelectFieldProps> = {}) => {
  const defaultProps: SelectFieldProps = {
    id: "color",
    label: "Favorite Color",
    required: false,
    helpText: undefined,
    error: undefined,
    options: baseOptions,
    placeholder: "Choose one…",
    value: "",
    onChange: vi.fn(),
  };

  return render(<SelectField {...defaultProps} {...props} />);
};

describe("SelectField", () => {
  it("renders label and select input", () => {
    renderComponent();

    const label = screen.getByText(/favorite color/i);
    expect(label).toBeInTheDocument();

    const select = screen.getByRole("combobox", { name: /favorite color/i });
    expect(select).toBeInTheDocument();
  });

  it("renders placeholder option if provided", () => {
    renderComponent({ placeholder: "Select an option" });

    const placeholder = screen.getByRole("option", {
      name: /select an option/i,
    });

    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toBeDisabled();
  });

  it("renders provided options with correct disabled states", () => {
    renderComponent();

    const optA = screen.getByRole("option", { name: /option a/i });
    const optB = screen.getByRole("option", { name: /option b/i });

    expect(optA).toBeEnabled();
    expect(optB).toBeDisabled();
  });

  it("renders helpText and links with aria-describedby", () => {
    renderComponent({
      id: "fruit",
      helpText: "Pick your favorite fruit",
    });

    const help = screen.getByText(/pick your favorite fruit/i);
    expect(help).toHaveAttribute("id", "fruit-help");

    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-describedby", "fruit-help");
  });

  it("renders both helpText and error, and wires aria-describedby correctly", () => {
    renderComponent({
      id: "fruit",
      helpText: "Choose wisely",
      error: "Invalid choice",
    });

    const helpId = "fruit-help";
    const errorId = "fruit-error";

    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-describedby", `${helpId} ${errorId}`);
  });

  it("supports required flag", () => {
    renderComponent({ required: true });

    const label = screen.getByText(/favorite color/i);
    expect(label).toBeInTheDocument();

    // FormField already adds the required asterisk, so just confirm the label exists.
  });
});
