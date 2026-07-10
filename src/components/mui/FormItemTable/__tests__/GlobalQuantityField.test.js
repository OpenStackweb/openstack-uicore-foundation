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
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import GlobalQuantityField from "../components/GlobalQuantityField";

const row = { form_item_id: 1, quantity_limit_per_sponsor: 5 };
const fieldName = `i-${row.form_item_id}-c-global-f-quantity`;

const renderField = (props = {}, onSubmit = jest.fn()) =>
  render(
    <Formik initialValues={{ [fieldName]: 0 }} onSubmit={onSubmit}>
      <Form>
        <GlobalQuantityField
          row={row}
          extraColumns={[]}
          value={0}
          {...props}
        />
        <button type="submit">submit</button>
      </Form>
    </Formik>
  );

describe("GlobalQuantityField", () => {
  test("renders a number input", () => {
    renderField();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  test("input is not disabled by default", () => {
    renderField();
    expect(screen.getByRole("spinbutton")).not.toBeDisabled();
  });

  test("input is disabled when disabled prop is true", () => {
    renderField({ disabled: true });
    expect(screen.getByRole("spinbutton")).toBeDisabled();
  });

  test("input has readOnly when extraColumns includes Quantity type", () => {
    renderField({ extraColumns: [{ type: "Quantity" }] });
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("readonly");
  });

  test("input does not have readOnly when extraColumns has no Quantity", () => {
    renderField({ extraColumns: [{ type: "Text" }] });
    const input = screen.getByRole("spinbutton");
    expect(input).not.toHaveAttribute("readonly");
  });

  test("input is not readOnly when the row has an Item-class Quantity field but extraColumns has no Form-class Quantity field", () => {
    // Item-class Quantity metafields are per-row data entry fields, unrelated
    // to the row's global quantity — only a Form-class Quantity column
    // (extraColumns) may drive/lock the global quantity field.
    const rowWithItemLevelQuantity = {
      ...row,
      meta_fields: [{ type_id: 1, class_field: "Item", type: "Quantity" }]
    };
    renderField({ row: rowWithItemLevelQuantity, extraColumns: [] });
    const input = screen.getByRole("spinbutton");
    expect(input).not.toHaveAttribute("readonly");
    expect(input).not.toBeDisabled();
  });

  test("clamps value to quantity_limit_per_sponsor when user types above it", async () => {
    const onSubmit = jest.fn();
    renderField({}, onSubmit);
    const input = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("submit");
    await act(async () => {
      fireEvent.change(input, { target: { value: "10" } });
      await userEvent.click(submitButton);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ [fieldName]: 5 }),
      expect.anything()
    );
  });

  test("resets to 0 (not silent no-op) when field is cleared", async () => {
    const onSubmit = jest.fn();
    renderField({ value: 5 }, onSubmit);
    const input = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("submit");
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
      await userEvent.click(submitButton);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ [fieldName]: 0 }),
      expect.anything()
    );
  });

  test("stays at 0 (not negative) when down-arrow decrements from 0", async () => {
    const onSubmit = jest.fn();
    renderField({}, onSubmit);
    const input = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("submit");
    await act(async () => {
      fireEvent.change(input, { target: { value: "-1" } });
      await userEvent.click(submitButton);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ [fieldName]: 0 }),
      expect.anything()
    );
  });

  test("does not apply upper bound when quantity_limit_per_sponsor is 0 (unlimited)", async () => {
    const onSubmit = jest.fn();
    const zeroLimitRow = { ...row, quantity_limit_per_sponsor: 0 };
    renderField({ row: zeroLimitRow }, onSubmit);
    const input = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("submit");
    await act(async () => {
      fireEvent.change(input, { target: { value: "3" } });
      await userEvent.click(submitButton);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ [fieldName]: 3 }),
      expect.anything()
    );
  });

  test("strips leading zeros", async () => {
    const onSubmit = jest.fn();
    renderField({ value: 1 }, onSubmit);
    const input = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("submit");
    await act(async () => {
      fireEvent.change(input, { target: { value: "01" } });
      await userEvent.click(submitButton);
    });
    expect(input).toHaveDisplayValue("1");
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ [fieldName]: 1 }),
      expect.anything()
    );
  });

  test("does not apply upper bound when quantity_limit_per_sponsor is undefined", async () => {
    const onSubmit = jest.fn();
    const unlimitedRow = { form_item_id: 1 };
    renderField({ row: unlimitedRow }, onSubmit);
    const input = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("submit");
    await act(async () => {
      fireEvent.change(input, { target: { value: "100" } });
      await userEvent.click(submitButton);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ [fieldName]: 100 }),
      expect.anything()
    );
  });
});
