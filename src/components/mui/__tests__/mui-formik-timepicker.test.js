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

jest.mock("@mui/x-date-pickers/LocalizationProvider", () => ({
  LocalizationProvider: ({ children }) => children
}));

jest.mock("@mui/x-date-pickers/AdapterMoment", () => ({
  AdapterMoment: function AdapterMoment() {}
}));

jest.mock("@mui/x-date-pickers/TimePicker", () => ({
  TimePicker: ({ slotProps }) => {
    const React = require("react");
    const tf = slotProps?.textField || {};
    return (
      <div>
        <input
          data-testid="timepicker-input"
          disabled={tf.disabled || false}
          readOnly
        />
        {tf.error && <span data-testid="timepicker-error">{tf.helperText}</span>}
      </div>
    );
  }
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import MuiFormikTimepicker from "../formik-inputs/mui-formik-timepicker";

const renderWithFormik = (props, initialValues = { timeField: null }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikTimepicker name="timeField" {...props} />
      </Form>
    </Formik>
  );

describe("MuiFormikTimepicker", () => {
  test("renders the timepicker input", () => {
    renderWithFormik({});
    expect(screen.getByTestId("timepicker-input")).toBeInTheDocument();
  });

  test("renders as disabled when disabled prop is true", () => {
    renderWithFormik({ disabled: true });
    expect(screen.getByTestId("timepicker-input")).toBeDisabled();
  });

  test("renders as enabled by default", () => {
    renderWithFormik({});
    expect(screen.getByTestId("timepicker-input")).not.toBeDisabled();
  });

  test("shows error when touched and has error", () => {
    render(
      <Formik
        initialValues={{ timeField: null }}
        initialErrors={{ timeField: "Invalid time" }}
        initialTouched={{ timeField: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikTimepicker name="timeField" />
        </Form>
      </Formik>
    );
    expect(screen.getByTestId("timepicker-error")).toHaveTextContent(
      "Invalid time"
    );
  });
});
