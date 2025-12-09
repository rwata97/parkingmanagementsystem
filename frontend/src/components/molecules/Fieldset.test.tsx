import React from "react";
import { render, screen } from "@testing-library/react";
import { Fieldset } from "@/components/molecules/Fieldset";

type FieldsetProps = React.ComponentProps<typeof Fieldset>;

const renderComponent = (props: Partial<FieldsetProps> = {}) => {
  const defaultProps: FieldsetProps = {
    legend: "User Info",
    children: <div data-testid="content">Content here</div>,
  };

  return render(<Fieldset {...defaultProps} {...props} />);
};

describe("Fieldset", () => {
  it("renders a fieldset and legend", () => {
    renderComponent({ legend: "Personal Details" });

    const fieldset = screen.getByRole("group"); // <fieldset> maps to role="group"
    const legend = screen.getByText(/personal details/i);

    expect(fieldset).toBeInTheDocument();
    expect(legend).toBeInTheDocument();
    expect(legend.tagName).toBe("LEGEND");
  });

  it("renders children inside the fieldset content area", () => {
    renderComponent();

    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    renderComponent({ description: "Additional instructions" });

    const desc = screen.getByText(/additional instructions/i);
    expect(desc).toBeInTheDocument();
  });

  it("does not render a description when none is provided", () => {
    renderComponent({ description: undefined });

    const desc = screen.queryByText(/additional instructions/i);
    expect(desc).not.toBeInTheDocument();
  });

  it("accepts a custom className without breaking rendering", () => {
    renderComponent({ className: "my-fieldset" });

    const fieldset = screen.getByRole("group");
    expect(fieldset).toBeInTheDocument();
  });
});
