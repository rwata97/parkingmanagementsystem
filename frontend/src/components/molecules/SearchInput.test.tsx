import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "@/components/molecules/SearchInput";

type SearchInputProps = React.ComponentProps<typeof SearchInput>;

const renderComponent = (props: Partial<SearchInputProps> = {}) => {
  const defaultProps: SearchInputProps = {
    value: "",
    onChange: vi.fn(),
    placeholder: "Search…",
  };

  return render(<SearchInput {...defaultProps} {...props} />);
};

describe("SearchInput", () => {
  it("renders an input with default placeholder and search icon", () => {
    renderComponent();

    const input = screen.getByRole("textbox", { name: /search/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Search…");

    // icon is the magnifying glass span
    expect(screen.getByText("🔎")).toBeInTheDocument();
  });

  it("allows overriding the placeholder", () => {
    renderComponent({ placeholder: "Filter items" });

    const input = screen.getByRole("textbox", { name: /search/i });
    expect(input).toHaveAttribute("placeholder", "Filter items");
  });

  it("passes the current value into the input", () => {
    renderComponent({ value: "hello" });

    const input = screen.getByRole("textbox", {
      name: /search/i,
    }) as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  it("calls onChange with the new string value when the user types", () => {
    const handleChange = vi.fn();
    renderComponent({ onChange: handleChange, value: "" });

    const input = screen.getByRole("textbox", { name: /search/i });

    fireEvent.change(input, { target: { value: "boat" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("boat");
  });
});
