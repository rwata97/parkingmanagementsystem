import React from "react";
import { render, screen } from "@testing-library/react";
import { Divider } from "@/components/atoms/Divider";

type DividerProps = Parameters<typeof Divider>[0];

const renderComponent = (props: Partial<DividerProps> = {}) => {
  const defaultProps: DividerProps = {};
  return render(<Divider {...defaultProps} {...props} />);
};

describe("Divider", () => {
  it("renders an hr element with separator role", () => {
    renderComponent();

    const divider = screen.getByRole("separator");

    expect(divider).toBeInTheDocument();
    expect(divider.tagName).toBe("HR");
  });

  it("accepts a custom className without crashing", () => {
    renderComponent({ className: "my-custom-class" });

    const divider = screen.getByRole("separator");

    expect(divider).toBeInTheDocument();
    // we don't need to assert on the actual className to keep tests styling-agnostic
  });
});
