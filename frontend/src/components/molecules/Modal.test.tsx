import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "@/components/molecules/Modal";

type ModalProps = React.ComponentProps<typeof Modal>;

const renderComponent = (props: Partial<ModalProps> = {}) => {
  const defaultProps: ModalProps = {
    open: true,
    title: "Test modal",
    onClose: vi.fn(),
    children: <div>Modal content</div>,
  };

  return render(<Modal {...defaultProps} {...props} />);
};

describe("Modal", () => {
  it("does not render anything when open is false", () => {
    renderComponent({ open: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog with title and content when open", () => {
    renderComponent({ title: "My dialog", children: <p>Some content</p> });

    const dialog = screen.getByRole("dialog", { name: /my dialog/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Some content")).toBeInTheDocument();
  });

  it("links dialog and title via aria-labelledby", () => {
    renderComponent({ title: "Accessible title" });

    const dialog = screen.getByRole("dialog", { name: /accessible title/i });
    const heading = screen.getByRole("heading", { name: /accessible title/i });

    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(heading).toHaveAttribute("id", labelledBy!);
  });

  it("calls onClose when backdrop is clicked", () => {
    const handleClose = vi.fn();
    renderComponent({ onClose: handleClose });

    // With a portal, the backdrop might not be in RTL's container,
    // so use document.querySelector instead of container.querySelector.
    const backdrop = document.querySelector(
      '[aria-hidden="true"]'
    ) as HTMLElement;
    expect(backdrop).toBeInTheDocument();

    fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the close button is clicked", () => {
    const handleClose = vi.fn();
    renderComponent({ onClose: handleClose });

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when OK button is clicked if no custom footer is provided", () => {
    const handleClose = vi.fn();
    renderComponent({ onClose: handleClose });

    const okButton = screen.getByRole("button", { name: /ok/i });
    expect(okButton).toBeInTheDocument();

    fireEvent.click(okButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders a custom footer instead of the default OK button when footer is provided", () => {
    const handleClose = vi.fn();
    renderComponent({
      onClose: handleClose,
      footer: <button type="button">Custom action</button>,
    });

    expect(screen.getByText(/custom action/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /ok/i })
    ).not.toBeInTheDocument();
  });

  it("closes when Escape key is pressed", () => {
    const handleClose = vi.fn();
    renderComponent({ onClose: handleClose });

    // keydown listener is attached to document in the effect
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("supports different size variants without crashing", () => {
    const { rerender } = renderComponent({ size: "sm", title: "Small" });
    expect(screen.getByRole("dialog", { name: /small/i })).toBeInTheDocument();

    rerender(
      <Modal open size="md" title="Medium" onClose={vi.fn()}>
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByRole("dialog", { name: /medium/i })).toBeInTheDocument();

    rerender(
      <Modal open size="lg" title="Large" onClose={vi.fn()}>
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByRole("dialog", { name: /large/i })).toBeInTheDocument();
  });

  it("moves focus into the dialog on open (basic focus management)", () => {
    renderComponent({ title: "Focus dialog" });

    const dialog = screen.getByRole("dialog", { name: /focus dialog/i });

    // basic focus assertion – dialog or its content should have focus
    expect(document.activeElement).toBe(dialog);
  });
});
