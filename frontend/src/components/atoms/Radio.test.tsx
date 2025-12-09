import React, { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Radio } from "@/components/atoms/Radio";

type RadioProps = React.ComponentProps<typeof Radio>;

const renderComponent = (props: Partial<RadioProps> = {}) => {
  const defaultProps: RadioProps = {
    name: "test-group",
  };
  return render(<Radio {...defaultProps} {...props} />);
};

describe("Radio", () => {
  it("renders an input of type radio", () => {
    renderComponent();
    const radio = screen.getByRole("radio");

    expect(radio).toBeInTheDocument();
    expect(radio).toHaveAttribute("type", "radio");
  });

  it("can be selected", () => {
    renderComponent();
    const radio = screen.getByRole("radio") as HTMLInputElement;

    expect(radio.checked).toBe(false);

    fireEvent.click(radio);

    expect(radio.checked).toBe(true);
  });

  it("calls onChange when selected", () => {
    const handleChange = vi.fn();
    renderComponent({ onChange: handleChange });

    const radio = screen.getByRole("radio");

    fireEvent.click(radio);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("forwards ref to the underlying input element", () => {
    const ref = createRef<HTMLInputElement>();

    renderComponent({ ref });

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("accepts a custom className without breaking rendering", () => {
    renderComponent({ className: "my-radio" });

    expect(screen.getByRole("radio")).toBeInTheDocument();
  });
});
