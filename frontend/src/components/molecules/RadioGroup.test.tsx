import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RadioGroup } from "@/components/molecules/RadioGroup";

type RadioGroupProps = React.ComponentProps<typeof RadioGroup>;

const baseItems = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
];

const renderComponent = (props: Partial<RadioGroupProps> = {}) => {
  const defaultProps: RadioGroupProps = {
    name: "test-radio",
    label: "Test Radio Group",
    required: false,
    items: baseItems,
    value: undefined,
    onChange: vi.fn(),
  };

  return render(<RadioGroup {...defaultProps} {...props} />);
};

describe("RadioGroup", () => {
  it("renders label and all radio items", () => {
    renderComponent();

    // group label
    expect(screen.getByText("Test Radio Group")).toBeInTheDocument();

    // individual radios by label
    expect(screen.getByLabelText("Option A")).toBeInTheDocument();
    expect(screen.getByLabelText("Option B")).toBeInTheDocument();
  });

  it("checks the radio that matches the value prop", () => {
    renderComponent({ value: "a" });

    const radioA = screen.getByLabelText("Option A") as HTMLInputElement;
    const radioB = screen.getByLabelText("Option B") as HTMLInputElement;

    expect(radioA.checked).toBe(true);
    expect(radioB.checked).toBe(false);
  });

  it("calls onChange with selected value when a radio is changed", () => {
    const handleChange = vi.fn();
    renderComponent({ value: undefined, onChange: handleChange });

    const radioB = screen.getByLabelText("Option B");

    fireEvent.click(radioB);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("b");
  });

  it("renders helpText and error and wires aria-describedby on the fieldset", () => {
    const { container } = renderComponent({
      name: "favorite-color",
      helpText: "Choose one of the options.",
      error: "You must select a color.",
    });

    const helpId = "favorite-color-help";
    const errorId = "favorite-color-error";

    const help = screen.getByText(/choose one of the options/i);
    const error = screen.getByText(/you must select a color/i);

    expect(help).toHaveAttribute("id", helpId);
    expect(error).toHaveAttribute("id", errorId);

    const fieldset = container.querySelector("fieldset") as HTMLElement;
    expect(fieldset).toBeInTheDocument();
    expect(fieldset.getAttribute("aria-describedby")).toBe(
      `${helpId} ${errorId}`
    );
  });

  it("sets aria-invalid on radios when error is present", () => {
    renderComponent({
      error: "Selection required",
    });

    const radioA = screen.getByLabelText("Option A");
    const radioB = screen.getByLabelText("Option B");

    expect(radioA).toHaveAttribute("aria-invalid", "true");
    expect(radioB).toHaveAttribute("aria-invalid", "true");
  });

  it("renders helpText only when provided", () => {
    renderComponent({
      helpText: "Helpful hint",
    });

    expect(screen.getByText(/helpful hint/i)).toBeInTheDocument();
  });

  it("renders error only when provided", () => {
    renderComponent({
      error: "Something went wrong",
    });

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("supports inline layout without affecting item rendering", () => {
    renderComponent({ inline: true });

    // still renders all radios; we don't assert layout classes.
    expect(screen.getByLabelText("Option A")).toBeInTheDocument();
    expect(screen.getByLabelText("Option B")).toBeInTheDocument();
  });
});
