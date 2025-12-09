// src/components/atoms/__tests__/Badge.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Active</Badge>);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders with different tones without crashing", () => {
    const { rerender } = render(<Badge tone="neutral">Neutral</Badge>);
    expect(screen.getByText("Neutral")).toBeInTheDocument();

    rerender(<Badge tone="success">Success</Badge>);
    expect(screen.getByText("Success")).toBeInTheDocument();

    rerender(<Badge tone="warning">Warning</Badge>);
    expect(screen.getByText("Warning")).toBeInTheDocument();

    rerender(<Badge tone="danger">Danger</Badge>);
    expect(screen.getByText("Danger")).toBeInTheDocument();

    rerender(<Badge tone="info">Info</Badge>);
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("renders an icon when provided", () => {
    render(
      <Badge icon={<span data-testid="badge-icon">★</span>}>With icon</Badge>
    );

    expect(screen.getByText("With icon")).toBeInTheDocument();
    expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
    expect(screen.getByText("★")).toBeInTheDocument();
  });

  it("does not render an icon container when icon is not provided", () => {
    render(<Badge>No icon</Badge>);

    expect(screen.getByText("No icon")).toBeInTheDocument();
    expect(screen.queryByTestId("badge-icon")).not.toBeInTheDocument();
  });

  it("accepts a custom className prop without breaking rendering", () => {
    render(<Badge className="my-custom-class">Custom</Badge>);

    expect(screen.getByText("Custom")).toBeInTheDocument();
  });
});
