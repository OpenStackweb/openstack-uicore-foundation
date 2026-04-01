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
import userEvent from "@testing-library/user-event";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import MuiFormikSwitch from "../formik-inputs/mui-formik-switch";

const renderWithFormik = (props, initialValues = { enabled: false }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikSwitch name="enabled" label="Enable Feature" {...props} />
      </Form>
    </Formik>
  );

describe("MuiFormikSwitch", () => {
  test("renders with label", () => {
    renderWithFormik({});
    expect(screen.getByText("Enable Feature")).toBeInTheDocument();
  });

  test("renders a switch (checkbox role)", () => {
    renderWithFormik({});
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  test("is off when initial value is false", () => {
    renderWithFormik({});
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  test("is on when initial value is true", () => {
    renderWithFormik({}, { enabled: true });
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  test("toggles on click", async () => {
    renderWithFormik({});
    const toggle = screen.getByRole("checkbox");
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
  });

  test("shows error when touched and has error", () => {
    render(
      <Formik
        initialValues={{ enabled: false }}
        initialErrors={{ enabled: "Required" }}
        initialTouched={{ enabled: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikSwitch name="enabled" label="Enable" />
        </Form>
      </Formik>
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
