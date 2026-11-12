/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AsyncSelectInput from "../AsyncSelectInput";

jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

// Jest compiles JSX with the automatic runtime, which ignores defaultProps on
// function components, so this covers the defaults React 19 consumers rely on.
describe("AsyncSelectInput defaults", () => {
  it("formats results with the default formatOption when none is given", async () => {
    const queryFunction = jest.fn((input, callback) =>
      callback([{ id: 1, name: "Acme" }])
    );

    render(
      <AsyncSelectInput
        id="company"
        queryFunction={queryFunction}
        onChange={jest.fn()}
      />
    );

    fireEvent.mouseDown(screen.getByRole("combobox"));

    expect(await screen.findByRole("option", { name: "Acme" })).toBeInTheDocument();
    expect(queryFunction).toHaveBeenCalledWith("", expect.any(Function));
  });

  it("debounces searches by default", () => {
    jest.useFakeTimers();
    const queryFunction = jest.fn((input, callback) => callback([]));

    render(
      <AsyncSelectInput
        id="company"
        queryFunction={queryFunction}
        onChange={jest.fn()}
      />
    );
    queryFunction.mockClear();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "ac" }
    });
    jest.advanceTimersByTime(249);
    expect(queryFunction).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(queryFunction).toHaveBeenCalledWith("ac", expect.any(Function));
    jest.useRealTimers();
  });
});
