import React, { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "@/components/atoms/Checkbox";

type CheckboxProps = React.ComponentProps<typeof Checkbox>;

const renderComponent = (props: Partial<CheckboxProps> = {}) => {
  const defaultProps: CheckboxProps = {};
  return render(<Checkbox {...defaultProps} {...props} />);
};

describe("Checkbox", () => {
  it("renders an input of type checkbox", () => {
    renderComponent();
    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("type", "checkbox");
  });

  it("can be checked and unchecked", () => {
    renderComponent();
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it("calls onChange when toggled", () => {
    const handleChange = vi.fn();
    renderComponent({ onChange: handleChange });

    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("forwards ref to the underlying input element", () => {
    const ref = createRef<HTMLInputElement>();

    renderComponent({ ref });

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("supports defaultChecked prop", () => {
    renderComponent({ defaultChecked: true });
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

    expect(checkbox.checked).toBe(true);
  });
});
