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
import MuiFormikPriceField from "../formik-inputs/mui-formik-pricefield";

const renderWithFormik = (props, initialValues = { price: 0 }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikPriceField name="price" label="Price" {...props} />
      </Form>
    </Formik>
  );

describe("MuiFormikPriceField", () => {
  test("renders with dollar sign adornment", () => {
    renderWithFormik({});
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  test("renders with label", () => {
    renderWithFormik({});
    expect(screen.getByText("Price", { selector: "label" })).toBeInTheDocument();
  });

  test("displays value as-is when inCents is false", () => {
    renderWithFormik({}, { price: 50 });
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();
  });

  test("divides value by 100 when inCents is true", () => {
    renderWithFormik({ inCents: true }, { price: 1500 });
    expect(screen.getByDisplayValue("15")).toBeInTheDocument();
  });

  test("renders 0 display value when price is 0", () => {
    renderWithFormik({}, { price: 0 });
    expect(screen.getByDisplayValue("0")).toBeInTheDocument();
  });
});
