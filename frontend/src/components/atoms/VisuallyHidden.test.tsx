import React from "react";
import { render, screen } from "@testing-library/react";
import { VisuallyHidden } from "@/components/atoms/VisuallyHidden";

type Props = React.ComponentProps<typeof VisuallyHidden>;

const renderComponent = (props: Partial<Props> = {}) => {
  const defaultProps: Props = {
    children: "Hidden text",
  };

  return render(<VisuallyHidden {...defaultProps} {...props} />);
};

describe("VisuallyHidden", () => {
  it("renders a span element", () => {
    renderComponent({ children: "Screen reader only" });

    const el = screen.getByText(/screen reader only/i);

    expect(el).toBeInTheDocument();
    expect(el.tagName).toBe("SPAN");
  });

  it("renders children", () => {
    renderComponent({ children: "Hidden content" });

    expect(screen.getByText(/hidden content/i)).toBeInTheDocument();
  });
});
