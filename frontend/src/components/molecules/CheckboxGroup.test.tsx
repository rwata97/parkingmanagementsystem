import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CheckboxGroup } from "@/components/molecules/CheckboxGroup";

type CheckboxGroupProps = React.ComponentProps<typeof CheckboxGroup>;

const baseItems = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
];

const renderComponent = (props: Partial<CheckboxGroupProps> = {}) => {
  const defaultProps: CheckboxGroupProps = {
    name: "test-group",
    label: "Test Group",
    values: [],
    onChange: vi.fn(),
    items: baseItems,
  };

  return render(<CheckboxGroup {...defaultProps} {...props} />);
};

describe("CheckboxGroup", () => {
  it("renders legend label and all checkbox items", () => {
    renderComponent();

    // legend
    expect(screen.getByText("Test Group")).toBeInTheDocument();

    // items
    expect(screen.getByLabelText("Option A")).toBeInTheDocument();
    expect(screen.getByLabelText("Option B")).toBeInTheDocument();
  });

  it("checks checkboxes based on values prop", () => {
    renderComponent({ values: ["a"] });

    const checkboxA = screen.getByLabelText("Option A") as HTMLInputElement;
    const checkboxB = screen.getByLabelText("Option B") as HTMLInputElement;

    expect(checkboxA.checked).toBe(true);
    expect(checkboxB.checked).toBe(false);
  });

  it("calls onChange with updated values when a checkbox is toggled on", () => {
    const handleChange = vi.fn();
    renderComponent({ values: [], onChange: handleChange });

    const checkboxA = screen.getByLabelText("Option A");

    fireEvent.click(checkboxA);

    expect(handleChange).toHaveBeenCalledTimes(1);
    const newValues = handleChange.mock.calls[0][0] as string[];
    expect(newValues).toContain("a");
  });

  it("calls onChange with updated values when a checkbox is toggled off", () => {
    const handleChange = vi.fn();
    renderComponent({ values: ["a", "b"], onChange: handleChange });

    const checkboxB = screen.getByLabelText("Option B");

    fireEvent.click(checkboxB);

    expect(handleChange).toHaveBeenCalledTimes(1);
    const newValues = handleChange.mock.calls[0][0] as string[];
    expect(newValues).toContain("a");
    expect(newValues).not.toContain("b");
  });

  it("sets aria-invalid on checkboxes when error is present", () => {
    renderComponent({
      error: "Something went wrong",
    });

    const checkboxA = screen.getByLabelText("Option A");
    const checkboxB = screen.getByLabelText("Option B");

    expect(checkboxA).toHaveAttribute("aria-invalid", "true");
    expect(checkboxB).toHaveAttribute("aria-invalid", "true");
  });

  it("works in inline mode (layout still renders all items)", () => {
    renderComponent({ inline: true });

    expect(screen.getByLabelText("Option A")).toBeInTheDocument();
    expect(screen.getByLabelText("Option B")).toBeInTheDocument();
    // We intentionally don't assert layout classes, just that it still renders correctly.
  });
});
