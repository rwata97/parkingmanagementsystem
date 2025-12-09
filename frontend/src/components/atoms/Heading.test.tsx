import React from "react";
import { render, screen } from "@testing-library/react";
import { Heading } from "@/components/atoms/Heading";

type HeadingProps = React.ComponentProps<typeof Heading>;

const renderComponent = (props: Partial<HeadingProps> = {}) => {
  const defaultProps: HeadingProps = {
    children: "Hello world",
    level: 1,
  };

  return render(<Heading {...defaultProps} {...props} />);
};

describe("Heading", () => {
  it("renders a default h1 tag", () => {
    renderComponent();

    const heading = screen.getByRole("heading", { name: /hello world/i });

    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H1");
  });

  it("renders the correct heading tag for level 2", () => {
    renderComponent({ level: 2, children: "Section" });

    const heading = screen.getByRole("heading", { name: /section/i });

    expect(heading.tagName).toBe("H2");
  });

  it("renders the correct heading tag for level 3", () => {
    renderComponent({ level: 3, children: "Title" });

    const heading = screen.getByRole("heading", { name: /title/i });

    expect(heading.tagName).toBe("H3");
  });

  it("renders the correct heading tag for level 4", () => {
    renderComponent({ level: 4, children: "Subtitle" });

    const heading = screen.getByRole("heading", { name: /subtitle/i });

    expect(heading.tagName).toBe("H4");
  });

  it("renders children", () => {
    renderComponent({ children: "Custom Heading" });

    expect(
      screen.getByRole("heading", { name: /custom heading/i })
    ).toBeInTheDocument();
  });

  it("accepts a custom className without breaking rendering", () => {
    renderComponent({
      className: "my-custom-class",
      children: "Styled Heading",
    });

    const heading = screen.getByRole("heading", { name: /styled heading/i });
    expect(heading).toBeInTheDocument();
  });
});
