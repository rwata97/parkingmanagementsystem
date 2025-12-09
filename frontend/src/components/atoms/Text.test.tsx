import React from "react";
import { render, screen } from "@testing-library/react";
import { Text, Muted } from "@/components/atoms/Text";

type TextProps = React.ComponentProps<typeof Text>;
type MutedProps = React.ComponentProps<typeof Muted>;

const renderText = (props: Partial<TextProps> = {}) => {
  const defaultProps: TextProps = {
    children: "Hello text",
  };

  return render(<Text {...defaultProps} {...props} />);
};

const renderMuted = (props: Partial<MutedProps> = {}) => {
  const defaultProps: MutedProps = {
    children: "Muted text",
  };

  return render(<Muted {...defaultProps} {...props} />);
};

describe("Text", () => {
  it("renders as a <p> by default", () => {
    renderText({ children: "Default paragraph" });

    const text = screen.getByText(/default paragraph/i);

    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe("P");
  });

  it("renders using the 'as' prop when provided", () => {
    renderText({ as: "span", children: "Span text" });

    const text = screen.getByText(/span text/i);

    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe("SPAN");
  });

  it("renders children", () => {
    renderText({ children: "Custom text" });

    expect(screen.getByText(/custom text/i)).toBeInTheDocument();
  });

  it("accepts a custom className without breaking rendering", () => {
    renderText({ className: "my-text-class", children: "Styled text" });

    const text = screen.getByText(/styled text/i);
    expect(text).toBeInTheDocument();
  });
});

describe("Muted", () => {
  it("renders as a <p> element", () => {
    renderMuted({ children: "Muted" });

    const text = screen.getByText(/muted/i);

    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe("P");
  });

  it("renders children", () => {
    renderMuted({ children: "Muted content" });

    expect(screen.getByText(/muted content/i)).toBeInTheDocument();
  });

  it("accepts a custom className without breaking rendering", () => {
    renderMuted({ className: "my-muted-class", children: "Styled muted" });

    const text = screen.getByText(/styled muted/i);
    expect(text).toBeInTheDocument();
  });
});
