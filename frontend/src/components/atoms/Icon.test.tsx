import React from "react";
import { render, screen } from "@testing-library/react";
import { Icon } from "@/components/atoms/Icon";

type IconProps = React.ComponentProps<typeof Icon>;

const renderComponent = (props: Partial<IconProps> = {}) => {
  const defaultProps: IconProps = {
    children: <span data-testid="icon-child">★</span>,
  };

  return render(<Icon {...defaultProps} {...props} />);
};

describe("Icon", () => {
  it("renders children", () => {
    renderComponent();

    expect(screen.getByTestId("icon-child")).toBeInTheDocument();
  });

  it("sets role='img' and aria-label when label is provided", () => {
    renderComponent({ label: "Star icon" });

    const icon = screen.getByRole("img", { name: /star icon/i });
    expect(icon).toBeInTheDocument();
  });

  it("does not set role or aria-label when label is not provided", () => {
    renderComponent({ label: undefined });

    // There's no role="img" without a label
    const span = screen.getByTestId("icon-child").parentElement as HTMLElement;

    expect(span).toBeInTheDocument();
    expect(span.getAttribute("role")).toBeNull();
    expect(span.getAttribute("aria-label")).toBeNull();
  });
});
