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

jest.mock("../summit-addon-select", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ value, placeholder, inputProps }) => (
      <div
        data-testid="summit-addon-select"
        data-value={value}
        data-placeholder={placeholder}
        data-error={inputProps?.error ? "true" : "false"}
      >
        {placeholder}
      </div>
    )
  };
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import MuiFormikSummitAddonSelect from "../formik-inputs/mui-formik-summit-addon-select";

const renderWithFormik = (props, initialValues = { addon: "" }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikSummitAddonSelect name="addon" summitId={1} {...props} />
      </Form>
    </Formik>
  );

describe("MuiFormikSummitAddonSelect", () => {
  test("renders the SummitAddonSelect", () => {
    renderWithFormik({});
    expect(screen.getByTestId("summit-addon-select")).toBeInTheDocument();
  });

  test("passes placeholder to SummitAddonSelect", () => {
    renderWithFormik({ placeholder: "Choose addon" });
    expect(screen.getByText("Choose addon")).toBeInTheDocument();
  });

  test("passes error to inputProps when touched and has error", () => {
    render(
      <Formik
        initialValues={{ addon: "" }}
        initialErrors={{ addon: "Required" }}
        initialTouched={{ addon: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikSummitAddonSelect name="addon" summitId={1} />
        </Form>
      </Formik>
    );
    expect(screen.getByTestId("summit-addon-select")).toHaveAttribute(
      "data-error",
      "true"
    );
  });

  test("passes false error when not touched", () => {
    renderWithFormik({});
    expect(screen.getByTestId("summit-addon-select")).toHaveAttribute(
      "data-error",
      "false"
    );
  });
});
