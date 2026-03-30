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
import MuiFormikDiscountField from "../formik-inputs/mui-formik-discountfield";
import { DISCOUNT_TYPES } from "../../../utils/constants";

const renderWithFormik = (props, initialValues = { discount: 0 }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikDiscountField
          name="discount"
          label="Discount"
          {...props}
        />
      </Form>
    </Formik>
  );

describe("MuiFormikDiscountField", () => {
  test("renders % adornment for RATE discount type", () => {
    renderWithFormik({ discountType: DISCOUNT_TYPES.RATE });
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  test("renders $ adornment for AMOUNT discount type", () => {
    renderWithFormik({ discountType: DISCOUNT_TYPES.AMOUNT });
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  test("renders with label", () => {
    renderWithFormik({ discountType: DISCOUNT_TYPES.RATE });
    expect(screen.getByText("Discount", { selector: "label" })).toBeInTheDocument();
  });

  test("displays value as-is when inCents is false", () => {
    renderWithFormik({ discountType: DISCOUNT_TYPES.RATE }, { discount: 10 });
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
  });

  test("divides value by 100 when inCents is true", () => {
    renderWithFormik(
      { discountType: DISCOUNT_TYPES.AMOUNT, inCents: true },
      { discount: 500 }
    );
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });

  test("renders 0 when discount is 0", () => {
    renderWithFormik({ discountType: DISCOUNT_TYPES.RATE }, { discount: 0 });
    expect(screen.getByDisplayValue("0")).toBeInTheDocument();
  });
});
