/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import NumberInput from "../NumberInput";

jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

describe("NumberInput", () => {
  test("typing an intermediate value below min is not rewritten", () => {
    const onChange = jest.fn();
    render(<NumberInput id="n" value={null} min={10} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.change(input, { target: { value: "1" } });
    expect(onChange).toHaveBeenLastCalledWith({ target: { value: 1 } });

    fireEvent.change(input, { target: { value: "15" } });
    expect(onChange).toHaveBeenLastCalledWith({ target: { value: 15 } });
  });

  test("min is enforced on blur", () => {
    const onChange = jest.fn();
    render(<NumberInput id="n" value={3} min={10} onChange={onChange} />);

    fireEvent.blur(screen.getByRole("spinbutton"));
    expect(onChange).toHaveBeenLastCalledWith({ target: { value: 10 } });
  });

  test("max is not clamped while typing, only on blur", () => {
    const onChange = jest.fn();
    // Wrap in local state so onChange feeds back into a re-render, matching
    // real usage. A static value prop would let React snap the controlled
    // input back to blank between events, hiding blur-time clamping.
    const Wrapper = () => {
      const [value, setValue] = React.useState(null);
      const handleChange = (e) => {
        onChange(e);
        setValue(e.target.value);
      };
      return (
        <NumberInput id="n" value={value} max={100} onChange={handleChange} />
      );
    };
    render(<Wrapper />);
    const input = screen.getByRole("spinbutton");

    fireEvent.change(input, { target: { value: "150" } });
    expect(onChange).toHaveBeenLastCalledWith({ target: { value: 150 } });

    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith({ target: { value: 100 } });
  });

  test("does not emit onChange on blur when the value is already within bounds", () => {
    const onChange = jest.fn();
    render(
      <NumberInput id="n" value={5} min={0} max={10} onChange={onChange} />
    );

    fireEvent.blur(screen.getByRole("spinbutton"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
