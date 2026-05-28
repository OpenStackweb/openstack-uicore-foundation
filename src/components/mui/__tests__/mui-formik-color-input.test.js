/**
 * Copyright 2026 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import MuiFormikColorInput from "../formik-inputs/mui-formik-color-input";

const DEBOUNCE_MS = 250;
const PLACEHOLDER_KEY = "color_picker.placeholder";

const renderWithFormik = (props, initialValues = { testField: "" }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikColorInput name="testField" {...props} />
      </Form>
    </Formik>
  );

const renderWithSubmit = (initialValues = { testField: "" }, props = {}) => {
  const onSubmit = jest.fn();
  render(
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      <Form>
        <MuiFormikColorInput name="testField" {...props} />
        <button type="submit">Submit</button>
      </Form>
    </Formik>
  );
  return onSubmit;
};

// Restore real timers after each test to prevent leaking fake timers
afterEach(() => jest.useRealTimers());

const getColorInput = () => document.querySelector('input[type="color"]');

describe("MuiFormikColorInput", () => {
  test("renders a color input", () => {
    renderWithFormik({});
    expect(getColorInput()).toBeInTheDocument();
  });

  test("loads initial value: reflects value, shows clear button, hides placeholder", () => {
    renderWithFormik({}, { testField: "#ff0000" });
    expect(getColorInput()).toHaveValue("#ff0000");
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.queryByText(PLACEHOLDER_KEY)).not.toBeInTheDocument();
  });

  test("empty initial state: shows placeholder and no clear button", () => {
    renderWithFormik({});
    expect(screen.getByText(PLACEHOLDER_KEY)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("blur without selection: formik value stays empty and placeholder remains", async () => {
    const onSubmit = renderWithSubmit({ testField: "" });
    const input = getColorInput();

    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(screen.getByText(PLACEHOLDER_KEY)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ testField: "" }, expect.anything());
    });
  });

  // The useEffect resets hasValue to false whenever localValue changes (before the debounce
  // commits the new color to field.value). The clear button only appears after the debounce fires.
  test("select a color: shows clear button and hides placeholder after debounce", () => {
    jest.useFakeTimers();
    renderWithFormik({});

    fireEvent.change(getColorInput(), { target: { value: "#33aaff" } });
    act(() => jest.advanceTimersByTime(DEBOUNCE_MS));

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.queryByText(PLACEHOLDER_KEY)).not.toBeInTheDocument();
  });

  test("select a color: updates formik value after debounce", async () => {
    jest.useFakeTimers();
    const onSubmit = renderWithSubmit({ testField: "" });

    fireEvent.change(getColorInput(), { target: { value: "#33aaff" } });
    act(() => jest.advanceTimersByTime(DEBOUNCE_MS));
    jest.useRealTimers();

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ testField: "#33aaff" }, expect.anything());
    });
  });

  test("clear button: shows placeholder and hides clear button", () => {
    renderWithFormik({}, { testField: "#ff0000" });

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByText(PLACEHOLDER_KEY)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("clear button: resets formik value to empty", async () => {
    const onSubmit = renderWithSubmit({ testField: "#ff0000" });

    fireEvent.click(screen.getAllByRole("button")[0]);

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ testField: "" }, expect.anything());
    });
  });

  test("shows error message when field is touched and has an error", () => {
    render(
      <Formik
        initialValues={{ testField: "" }}
        initialErrors={{ testField: "Color is required" }}
        initialTouched={{ testField: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikColorInput name="testField" />
        </Form>
      </Formik>
    );
    expect(screen.getByText("Color is required")).toBeInTheDocument();
  });

  test("does not show error when field is not yet touched", () => {
    render(
      <Formik
        initialValues={{ testField: "" }}
        initialErrors={{ testField: "Color is required" }}
        initialTouched={{ testField: false }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikColorInput name="testField" />
        </Form>
      </Formik>
    );
    expect(screen.queryByText("Color is required")).not.toBeInTheDocument();
  });
});
