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
import { MenuItem } from "@mui/material";
import "@testing-library/jest-dom";
import MuiFormikSelect from "../formik-inputs/mui-formik-select";

const renderWithFormik = (props, initialValues = { color: "" }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikSelect name="color" {...props}>
          <MenuItem value="red">Red</MenuItem>
          <MenuItem value="blue">Blue</MenuItem>
        </MuiFormikSelect>
      </Form>
    </Formik>
  );

describe("MuiFormikSelect", () => {
  test("renders a combobox", () => {
    renderWithFormik({});
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("renders with label", () => {
    renderWithFormik({ label: "Color" });
    expect(screen.getByText("Color", { selector: "label" })).toBeInTheDocument();
  });

  test("shows placeholder when no value is selected", () => {
    renderWithFormik({ placeholder: "Pick a color" });
    expect(screen.getByText("Pick a color")).toBeInTheDocument();
  });

  test("shows error when touched and has error", () => {
    render(
      <Formik
        initialValues={{ color: "" }}
        initialErrors={{ color: "Required" }}
        initialTouched={{ color: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikSelect name="color">
            <MenuItem value="red">Red</MenuItem>
          </MuiFormikSelect>
        </Form>
      </Formik>
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  test("does not show error when not touched", () => {
    render(
      <Formik
        initialValues={{ color: "" }}
        initialErrors={{ color: "Required" }}
        initialTouched={{ color: false }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikSelect name="color">
            <MenuItem value="red">Red</MenuItem>
          </MuiFormikSelect>
        </Form>
      </Formik>
    );
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });
});
