import React from "react";
import { render, screen } from "@testing-library/react";
import { Spinner } from "@/components/atoms/Spinner";

type SpinnerProps = React.ComponentProps<typeof Spinner>;

const renderComponent = (props: Partial<SpinnerProps> = {}) => {
  const defaultProps: SpinnerProps = {};
  return render(<Spinner {...defaultProps} {...props} />);
};

describe("Spinner", () => {
  it("renders an svg with role='status' and loading label", () => {
    renderComponent();

    const spinner = screen.getByRole("status", { name: /loading/i });

    expect(spinner).toBeInTheDocument();
    expect(spinner.tagName).toBe("svg");
  });

  it("renders internal circle and path elements", () => {
    renderComponent();

    const circle = screen.getByRole("status").querySelector("circle");
    const path = screen.getByRole("status").querySelector("path");

    expect(circle).toBeInTheDocument();
    expect(path).toBeInTheDocument();
  });

  it("applies the size prop correctly", () => {
    renderComponent({ size: 40 });

    const spinner = screen.getByRole("status");

    expect(spinner).toHaveStyle({
      width: "40px",
      height: "40px",
    });
  });

  it("accepts a custom className without breaking rendering", () => {
    renderComponent({ className: "my-spinner" });

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
  });
});
