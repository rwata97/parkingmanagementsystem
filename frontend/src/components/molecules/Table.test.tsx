import { render, screen } from "@testing-library/react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/molecules/Table";

describe("Table Components", () => {
  it("renders a <table> with children", () => {
    render(
      <Table>
        <Thead>
          <Tr>
            <Th>Header</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Cell</Td>
          </Tr>
        </Tbody>
      </Table>
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Cell")).toBeInTheDocument();
  });

  it("renders Thead, Tbody, Tr, Th, and Td elements correctly", () => {
    const { container } = render(
      <Table>
        <Thead>
          <Tr>
            <Th>Col</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Val</Td>
          </Tr>
        </Tbody>
      </Table>
    );

    expect(container.querySelector("thead")).toBeInTheDocument();
    expect(container.querySelector("tbody")).toBeInTheDocument();
    expect(container.querySelector("tr")).toBeInTheDocument();
    expect(container.querySelector("th")).toBeInTheDocument();
    expect(container.querySelector("td")).toBeInTheDocument();
  });

  it("passes className through to elements without errors", () => {
    const { container } = render(
      <Table className="custom-table">
        <Tbody className="custom-body">
          <Tr className="custom-row">
            <Td className="custom-cell">Value</Td>
          </Tr>
        </Tbody>
      </Table>
    );

    expect(container.querySelector(".custom-table")).toBeInTheDocument();
    expect(container.querySelector(".custom-body")).toBeInTheDocument();
    expect(container.querySelector(".custom-row")).toBeInTheDocument();
    expect(container.querySelector(".custom-cell")).toHaveTextContent("Value");
  });

  it("allows arbitrary props to be passed through", () => {
    const { container } = render(
      <Table data-testid="test-table">
        <Tbody>
          <Tr data-row="1">
            <Td data-cell="a">A</Td>
          </Tr>
        </Tbody>
      </Table>
    );

    expect(screen.getByTestId("test-table")).toBeInTheDocument();
    expect(container.querySelector('[data-row="1"]')).toBeInTheDocument();
    expect(container.querySelector('[data-cell="a"]')).toBeInTheDocument();
  });
});
