import React from "react";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/atoms/Label";

type LabelProps = React.ComponentProps<typeof Label>;

const renderComponent = (props: Partial<LabelProps> = {}) => {
  const defaultProps: LabelProps = {
    children: "Name",
  };

  return render(<Label {...defaultProps} {...props} />);
};

describe("Label", () => {
  it("renders a label with text", () => {
    renderComponent({ children: "Email" });

    const label = screen.getByText(/email/i);

    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe("LABEL");
  });

  it("associates with an input via htmlFor", () => {
    render(
      <>
        <Label htmlFor="name-input">Name</Label>
        <input id="name-input" />
      </>
    );

    const input = screen.getByLabelText(/name/i);
    expect(input).toBeInTheDocument();
  });

  it("renders a required asterisk when required is true", () => {
    renderComponent({ children: "Email", required: true });

    const label = screen.getByText(/email/i);
    expect(label).toBeInTheDocument();

    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveAttribute("aria-hidden", "true");
  });

  it("does not render a required asterisk when required is false or undefined", () => {
    renderComponent({ children: "Email", required: false });

    expect(screen.getByText(/email/i)).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("accepts a custom className without breaking rendering", () => {
    renderComponent({
      children: "With class",
      className: "my-custom-class",
    });

    const label = screen.getByText(/with class/i);
    expect(label).toBeInTheDocument();
  });
});
