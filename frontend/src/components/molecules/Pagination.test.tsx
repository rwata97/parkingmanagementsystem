import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "@/components/molecules/Pagination";

type PaginationProps = React.ComponentProps<typeof Pagination>;

const renderComponent = (props: Partial<PaginationProps> = {}) => {
  const defaultProps: PaginationProps = {
    page: 1,
    pageSize: 10,
    total: 42,
    onPageChange: vi.fn(),
  };

  return render(<Pagination {...defaultProps} {...props} />);
};

describe("Pagination", () => {
  it("renders the correct range summary text", () => {
    renderComponent({
      page: 2,
      pageSize: 10,
      total: 42,
    });

    // page 2, size 10 → items 11–20 of 42
    expect(screen.getByText(/showing 11-20 of 42/i)).toBeInTheDocument();
  });

  it("renders the correct page / pageCount text", () => {
    renderComponent({
      page: 3,
      pageSize: 10,
      total: 42, // pageCount = 5
    });

    expect(screen.getByText(/3 \/ 5/i)).toBeInTheDocument();
  });

  it("disables Prev button on the first page", () => {
    renderComponent({
      page: 1,
      pageSize: 10,
      total: 42,
    });

    const prevButton = screen.getByRole("button", { name: /prev/i });
    const nextButton = screen.getByRole("button", { name: /next/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it("disables Next button on the last page", () => {
    renderComponent({
      page: 5,
      pageSize: 10,
      total: 42, // pageCount = 5
    });

    const prevButton = screen.getByRole("button", { name: /prev/i });
    const nextButton = screen.getByRole("button", { name: /next/i });

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it("calls onPageChange with page - 1 when Prev is clicked", () => {
    const handlePageChange = vi.fn();

    renderComponent({
      page: 3,
      pageSize: 10,
      total: 42,
      onPageChange: handlePageChange,
    });

    const prevButton = screen.getByRole("button", { name: /prev/i });

    fireEvent.click(prevButton);

    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with page + 1 when Next is clicked", () => {
    const handlePageChange = vi.fn();

    renderComponent({
      page: 2,
      pageSize: 10,
      total: 42,
      onPageChange: handlePageChange,
    });

    const nextButton = screen.getByRole("button", { name: /next/i });

    fireEvent.click(nextButton);

    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it("handles the case when total is not a multiple of pageSize", () => {
    renderComponent({
      page: 5,
      pageSize: 10,
      total: 42, // last page shows 41–42
    });

    expect(screen.getByText(/showing 41-42 of 42/i)).toBeInTheDocument();
  });

  it("handles the case when there is only one page", () => {
    renderComponent({
      page: 1,
      pageSize: 10,
      total: 5, // pageCount = 1
    });

    const prevButton = screen.getByRole("button", { name: /prev/i });
    const nextButton = screen.getByRole("button", { name: /next/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
    expect(screen.getByText(/1 \/ 1/i)).toBeInTheDocument();
  });
});
