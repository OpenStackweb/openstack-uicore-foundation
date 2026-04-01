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

import React from "react";
import { render, screen } from "@testing-library/react";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import MuiFormikTextField from "../formik-inputs/mui-formik-textfield";

const renderWithFormik = (props, initialValues = { testField: "" }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikTextField name="testField" {...props} />
      </Form>
    </Formik>
  );

describe("MuiFormikTextField", () => {
  test("renders a text input", () => {
    renderWithFormik({});
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("renders with label", () => {
    renderWithFormik({ label: "My Field" });
    expect(screen.getByText("My Field", { selector: "label" })).toBeInTheDocument();
  });

  test("appends * to label when required is true", () => {
    renderWithFormik({ label: "My Field", required: true });
    expect(screen.getByText("My Field *", { selector: "label" })).toBeInTheDocument();
  });

  test("shows character count when maxLength is set", () => {
    renderWithFormik({ maxLength: 100 }, { testField: "hello" });
    expect(screen.getByText("95 characters left")).toBeInTheDocument();
  });

  test("shows full maxLength count when field is empty", () => {
    renderWithFormik({ maxLength: 50 }, { testField: "" });
    expect(screen.getByText("50 characters left")).toBeInTheDocument();
  });

  test("shows error message when touched and has error", () => {
    render(
      <Formik
        initialValues={{ testField: "" }}
        initialErrors={{ testField: "This field is required" }}
        initialTouched={{ testField: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikTextField name="testField" />
        </Form>
      </Formik>
    );
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  test("does not show error when field is not touched", () => {
    render(
      <Formik
        initialValues={{ testField: "" }}
        initialErrors={{ testField: "Error" }}
        initialTouched={{ testField: false }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikTextField name="testField" />
        </Form>
      </Formik>
    );
    expect(screen.queryByText("Error")).not.toBeInTheDocument();
  });

  test("renders with initial value", () => {
    renderWithFormik({}, { testField: "initial value" });
    expect(screen.getByDisplayValue("initial value")).toBeInTheDocument();
  });
});
