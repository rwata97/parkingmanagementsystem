import React from "react";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/molecules/Sidebar";

const renderComponent = () => render(<Sidebar />);

describe("Sidebar", () => {
  it("renders the informational tip", () => {
    renderComponent();

    expect(screen.getByText(/Raffles run every 3 months/i)).toBeInTheDocument();
  });

  it("renders a sign-out control pointing to /logout", () => {
    renderComponent();

    const signOutText = screen.getByText(/sign out/i);
    const signOutLink = signOutText.closest("a");

    expect(signOutLink).not.toBeNull();
    expect(signOutLink).toHaveAttribute("href", "/logout");
  });
});
