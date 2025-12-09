// src/components/atoms/Button.test.tsx
import React, { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/atoms/Button";

// Helper type: any props the Button can take
type ButtonProps = React.ComponentProps<typeof Button>;

// Shared render helper
const renderComponent = (props: Partial<ButtonProps> = {}) => {
  const defaultProps: ButtonProps = {
    children: "Click me",
  };

  return render(<Button {...defaultProps} {...props} />);
};

describe("Button", () => {
  it("renders children", () => {
    renderComponent({ children: "Click me" });

    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked and not disabled", () => {
    const handleClick = vi.fn();

    renderComponent({
      children: "Click me",
      onClick: handleClick,
    });

    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();

    renderComponent({
      children: "Disabled",
      disabled: true,
      onClick: handleClick,
    });

    const button = screen.getByRole("button", { name: /disabled/i });
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("disables the button and shows loading state when isLoading is true", () => {
    const handleClick = vi.fn();

    renderComponent({
      children: "Submit",
      isLoading: true,
      onClick: handleClick,
    });

    const button = screen.getByRole("button", { name: /loading…/i });

    // disabled via isLoading
    expect(button).toBeDisabled();
    // aria-busy should be set when loading
    expect(button).toHaveAttribute("aria-busy", "true");

    // clicking while loading should not trigger onClick
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();

    // loading spinner (the svg) should be present
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders left and right icons when provided and not loading", () => {
    renderComponent({
      children: "With icons",
      leftIcon: <span data-testid="left-icon">L</span>,
      rightIcon: <span data-testid="right-icon">R</span>,
    });

    const button = screen.getByRole("button", { name: /with icons/i });
    expect(button).toBeInTheDocument();

    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("does not show left or right icons while loading", () => {
    renderComponent({
      children: "With icons",
      isLoading: true,
      leftIcon: <span data-testid="left-icon">L</span>,
      rightIcon: <span data-testid="right-icon">R</span>,
    });

    // button is in loading state
    expect(
      screen.getByRole("button", { name: /loading…/i })
    ).toBeInTheDocument();

    // icons should be hidden when loading
    expect(screen.queryByTestId("left-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("right-icon")).not.toBeInTheDocument();
  });

  it("forwards ref to the underlying button element", () => {
    const ref = createRef<HTMLButtonElement>();

    renderComponent({
      children: "With ref",
      ref,
    });

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
