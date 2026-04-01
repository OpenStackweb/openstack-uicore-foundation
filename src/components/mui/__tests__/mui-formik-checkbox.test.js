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
import MuiFormikCheckbox from "../formik-inputs/mui-formik-checkbox";

const renderWithFormik = (props, initialValues = { agreed: false }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikCheckbox name="agreed" label="I Agree" {...props} />
      </Form>
    </Formik>
  );

describe("MuiFormikCheckbox", () => {
  test("renders with label", () => {
    renderWithFormik({});
    expect(screen.getByText("I Agree")).toBeInTheDocument();
  });

  test("renders a checkbox input", () => {
    renderWithFormik({});
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  test("is unchecked when initial value is false", () => {
    renderWithFormik({});
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  test("is checked when initial value is true", () => {
    renderWithFormik({}, { agreed: true });
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  test("toggles checked state on click", async () => {
    renderWithFormik({});
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test("shows error when touched and has error", () => {
    render(
      <Formik
        initialValues={{ agreed: false }}
        initialErrors={{ agreed: "You must agree" }}
        initialTouched={{ agreed: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikCheckbox name="agreed" label="I Agree" />
        </Form>
      </Formik>
    );
    expect(screen.getByText("You must agree")).toBeInTheDocument();
  });

  test("does not show error when not touched", () => {
    render(
      <Formik
        initialValues={{ agreed: false }}
        initialErrors={{ agreed: "You must agree" }}
        initialTouched={{ agreed: false }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikCheckbox name="agreed" label="I Agree" />
        </Form>
      </Formik>
    );
    expect(screen.queryByText("You must agree")).not.toBeInTheDocument();
  });
});
