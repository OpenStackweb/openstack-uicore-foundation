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
import { render, screen } from "@testing-library/react";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import MuiFormikDropdownRadio from "../formik-inputs/mui-formik-dropdown-radio";

const options = [
  { value: 1, label: "Option A" },
  { value: 2, label: "Option B" }
];

const renderWithFormik = (props, initialValues = { testField: "" }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikDropdownRadio
          name="testField"
          options={options}
          {...props}
        />
      </Form>
    </Formik>
  );

describe("MuiFormikDropdownRadio", () => {
  test("renders a combobox", () => {
    renderWithFormik({});
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("shows default i18n placeholder when no value selected", () => {
    renderWithFormik({});
    expect(screen.getByText("general.select_an_option")).toBeInTheDocument();
  });

  test("shows custom placeholder when provided", () => {
    renderWithFormik({ placeholder: "Pick one" });
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  test("shows selected option label when value is set", () => {
    renderWithFormik({}, { testField: 1 });
    expect(screen.getByText("Option A")).toBeInTheDocument();
  });

  test("renders without errors with empty options", () => {
    const { container } = render(
      <Formik initialValues={{ testField: "" }} onSubmit={jest.fn()}>
        <Form>
          <MuiFormikDropdownRadio name="testField" options={[]} />
        </Form>
      </Formik>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
