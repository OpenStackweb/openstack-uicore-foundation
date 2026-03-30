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

// mui-formik-checkbox-group.test.js
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import MuiFormikCheckboxGroup from "../formik-inputs/mui-formik-checkbox-group";

// Helper function to render the component with Formik
const renderWithFormik = (props, initialValues = { testField: [] }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikCheckboxGroup name="testField" {...props} />
      </Form>
    </Formik>
  );

describe("MuiFormikCheckboxGroup", () => {
  const options = [
    { value: 1, label: "Option 1" },
    { value: 2, label: "Option 2" },
    { value: 3, label: "Option 3" }
  ];

  test("renders the component with label", () => {
    renderWithFormik({ label: "Test Label", options });

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  test("renders all checkboxes unchecked when no values are selected", () => {
    renderWithFormik({ options });

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  });

  test("renders with pre-selected values", () => {
    renderWithFormik({ options }, { testField: [1, 3] });

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked(); // Option 1
    expect(checkboxes[1]).not.toBeChecked(); // Option 2
    expect(checkboxes[2]).toBeChecked(); // Option 3
  });

  test("handles checking a checkbox", async () => {
    renderWithFormik({ options });

    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[0]);

    // After clicking, the first checkbox should be checked
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  test("handles unchecking a checkbox", async () => {
    renderWithFormik({ options }, { testField: [1, 2] });

    const checkboxes = screen.getAllByRole("checkbox");
    // Initial state
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();

    // Uncheck the first checkbox
    await userEvent.click(checkboxes[0]);

    // After clicking, only the second checkbox should remain checked
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  test("handles non-array initial values gracefully", () => {
    renderWithFormik({ options }, { testField: null });

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  });

  test("displays error message when touched and has error", () => {
    render(
      <Formik
        initialValues={{ testField: [] }}
        initialErrors={{ testField: "This field is required" }}
        initialTouched={{ testField: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikCheckboxGroup name="testField" options={options} />
        </Form>
      </Formik>
    );

    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  test("does not display error message when not touched", () => {
    render(
      <Formik
        initialValues={{ testField: [] }}
        initialErrors={{ testField: "This field is required" }}
        initialTouched={{ testField: false }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikCheckboxGroup name="testField" options={options} />
        </Form>
      </Formik>
    );

    expect(
      screen.queryByText("This field is required")
    ).not.toBeInTheDocument();
  });

  test("parses checkbox values as integers", async () => {
    // Using a mock to inspect the actual value set in Formik
    const mockSetValue = jest.fn();

    render(
      <Formik initialValues={{ testField: [] }} onSubmit={jest.fn()}>
        {() => {
          // Override useField to spy on setValue
          const originalUseField = require("formik").useField;
          jest
            .spyOn(require("formik"), "useField")
            .mockImplementation((props) => {
              const [field, meta, helpers] = originalUseField(props);
              return [field, meta, { ...helpers, setValue: mockSetValue }];
            });

          return (
            <Form>
              <MuiFormikCheckboxGroup name="testField" options={options} />
            </Form>
          );
        }}
      </Formik>
    );

    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[0]);

    // Check that setValue was called with the correct value (integer 1, not string '1')
    expect(mockSetValue).toHaveBeenCalledWith([1]);

    // Restore the original implementation
    require("formik").useField.mockRestore();
  });
});
