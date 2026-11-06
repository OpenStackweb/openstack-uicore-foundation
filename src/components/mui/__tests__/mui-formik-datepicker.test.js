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
import moment from "moment-timezone";
import MuiFormikDatepicker from "../formik-inputs/mui-formik-datepicker";

const renderWithFormik = (props, initialValues = { test_date: null }) =>
  render(
    <Formik
      initialValues={initialValues}
      validate={(values) => {
        const errors = {};
        if (!values.test_date) {
          errors.test_date = "This field is required";
        }
        return errors;
      }}
      onSubmit={jest.fn()}
    >
      <Form>
        <MuiFormikDatepicker name="test_date" label="Test Date" {...props} />
        <button type="submit">Submit</button>
      </Form>
    </Formik>
  );

describe("MuiFormikDatepicker", () => {
  test("shows required marker in label", () => {
    renderWithFormik({ required: true });

    expect(screen.getByLabelText("Test Date *")).toBeInTheDocument();
  });

  test("shows validation error on submit without value", async () => {
    renderWithFormik({ required: true });

    expect(
      screen.queryByText("This field is required")
    ).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("This field is required")).toBeInTheDocument();
  });

  test("retains selected date after picker closes", async () => {
    const user = userEvent.setup();
    renderWithFormik({ required: true });

    await user.click(screen.getByLabelText("Test Date *"));
    await user.click(screen.getByRole("button", { name: "Choose date" }));

    const today = await screen.findByRole("gridcell", {
      name: String(new Date().getDate())
    });
    await user.click(today);

    const input = screen.getByLabelText("Test Date *");
    expect(input).not.toHaveValue("");
    expect(input).not.toHaveValue("MM/DD/YYYY");
  });

  describe("timeZone", () => {
    // 3am UTC on Nov 6 is still Nov 5 in Los Angeles
    const value = moment.utc("2026-11-06T03:00:00Z");

    test("shows the value in the given time zone", () => {
      renderWithFormik(
        { timeZone: "America/Los_Angeles" },
        { test_date: value }
      );
      expect(screen.getByLabelText("Test Date")).toHaveValue("11/05/2026");
    });

    test("keeps the value's own time zone without it", () => {
      renderWithFormik({}, { test_date: value });
      expect(screen.getByLabelText("Test Date")).toHaveValue("11/06/2026");
    });
  });
});
