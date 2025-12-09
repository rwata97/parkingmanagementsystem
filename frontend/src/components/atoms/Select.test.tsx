import React, { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "@/components/atoms/Select";

type SelectProps = React.ComponentProps<typeof Select>;

const renderComponent = (props: Partial<SelectProps> = {}) => {
  const defaultProps: SelectProps = {
    children: (
      <>
        <option value="">Select an option</option>
        <option value="one">One</option>
        <option value="two">Two</option>
      </>
    ),
  };

  return render(<Select {...defaultProps} {...props} />);
};

describe("Select", () => {
  it("renders a select element with options", () => {
    renderComponent();

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThan(0);
  });

  it("allows changing the selected value", () => {
    renderComponent();

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    const option = screen.getByRole("option", {
      name: /one/i,
    }) as HTMLOptionElement;

    fireEvent.change(select, { target: { value: option.value } });

    expect(select.value).toBe("one");
  });

  it("calls onChange when the selected value changes", () => {
    const handleChange = vi.fn();

    renderComponent({ onChange: handleChange });

    const select = screen.getByRole("combobox") as HTMLSelectElement;

    fireEvent.change(select, { target: { value: "two" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("sets aria-invalid when invalid is true", () => {
    renderComponent({ invalid: true });

    const select = screen.getByRole("combobox");

    expect(select).toHaveAttribute("aria-invalid", "true");
  });

  it("does not set aria-invalid when invalid is false or undefined", () => {
    renderComponent({ invalid: false });

    const select = screen.getByRole("combobox");

    expect(select).not.toHaveAttribute("aria-invalid");
  });

  it("is disabled when disabled prop is true", () => {
    renderComponent({ disabled: true });

    const select = screen.getByRole("combobox");

    expect(select).toBeDisabled();
  });

  it("forwards ref to the underlying select element", () => {
    const ref = createRef<HTMLSelectElement>();

    renderComponent({ ref });

    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("accepts a custom className without breaking rendering", () => {
    renderComponent({ className: "my-select" });

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });
});
