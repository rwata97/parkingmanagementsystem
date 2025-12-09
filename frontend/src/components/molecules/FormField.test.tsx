import React from "react";
import { render, screen } from "@testing-library/react";
import { FormField } from "@/components/molecules/FormField";

type FormFieldProps = React.ComponentProps<typeof FormField>;

const renderComponent = (props: Partial<FormFieldProps> = {}) => {
  const defaultProps: FormFieldProps = {
    label: "Email",
    htmlFor: "email",
    children: <input id="email" />,
  };

  return render(<FormField {...defaultProps} {...props} />);
};

describe("FormField", () => {
  it("renders label associated with the control", () => {
    renderComponent({
      label: "Name",
      htmlFor: "name-input",
      children: <input id="name-input" />,
    });

    const input = screen.getByLabelText(/name/i);
    expect(input).toBeInTheDocument();
  });

  it("renders the provided child control", () => {
    renderComponent({
      children: <input id="email" placeholder="Enter email" />,
    });

    const input = screen.getByPlaceholderText(/enter email/i);
    expect(input).toBeInTheDocument();
  });

  it("accepts a custom className without breaking rendering", () => {
    renderComponent({
      className: "my-form-field",
      label: "Custom",
      htmlFor: "custom-input",
      children: <input id="custom-input" />,
    });

    const input = screen.getByLabelText(/custom/i);
    expect(input).toBeInTheDocument();
  });
});
