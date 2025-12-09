import React, { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/atoms/Input";

type InputProps = React.ComponentProps<typeof Input>;

const renderComponent = (props: Partial<InputProps> = {}) => {
  const defaultProps: InputProps = {
    placeholder: "Enter text",
  };

  return render(<Input {...defaultProps} {...props} />);
};

describe("Input", () => {
  it("renders an input element", () => {
    renderComponent();

    const input = screen.getByPlaceholderText(/enter text/i);

    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("allows typing", () => {
    renderComponent();

    const input = screen.getByPlaceholderText(
      /enter text/i
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "Hello" } });

    expect(input.value).toBe("Hello");
  });

  it("calls onChange handler when typing", () => {
    const handleChange = vi.fn();

    renderComponent({ onChange: handleChange });

    const input = screen.getByPlaceholderText(/enter text/i);

    fireEvent.change(input, { target: { value: "A" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("sets aria-invalid when invalid=true", () => {
    renderComponent({ invalid: true });

    const input = screen.getByPlaceholderText(/enter text/i);

    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("doesn't set aria-invalid when invalid is false or undefined", () => {
    renderComponent({ invalid: false });

    const input = screen.getByPlaceholderText(/enter text/i);

    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("is disabled when disabled prop is true", () => {
    renderComponent({ disabled: true });

    const input = screen.getByPlaceholderText(/enter text/i);

    expect(input).toBeDisabled();
  });

  it("forwards ref to the underlying input element", () => {
    const ref = createRef<HTMLInputElement>();

    renderComponent({ ref });

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
