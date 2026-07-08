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

// Integration coverage between AdditionalInputV2 and the real MetaFieldValuesV2
// (not mocked here, unlike additional-input.test.js) to verify baseName/fieldIndex
// wiring actually reaches the meta-field-values actions through the parent.

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik, Form, useFormikContext } from "formik";
import "@testing-library/jest-dom";
import AdditionalInputV2 from "../formik-inputs/additional-input/additional-input-v2";
import showConfirmDialog from "../showConfirmDialog";

jest.mock("../showConfirmDialog", () => jest.fn());

jest.mock(
  "../DragNDropList",
  () =>
    function MockDragAndDropList({ items, renderItem }) {
      return (
        <div data-testid="dnd-list">
          {items.map((item, index) => (
            <div key={item.id || index} data-testid={`dnd-item-${index}`}>
              {renderItem(item, index, { isDragging: false, dragHandleProps: {} })}
            </div>
          ))}
        </div>
      );
    }
);

const baseItem = {
  id: 1,
  name: "Color",
  type: "CheckBoxList",
  is_required: false,
  minimum_quantity: 0,
  maximum_quantity: 0,
  values: [
    { id: 101, name: "Red", value: "red", is_default: false, order: 1 },
    { id: 102, name: "Blue", value: "blue", is_default: true, order: 2 }
  ]
};

const defaultProps = {
  itemIdx: 0,
  baseName: "meta_fields",
  onAdd: jest.fn(),
  onDelete: jest.fn(),
  onDeleteValue: jest.fn(),
  entityId: 1,
  isAddDisabled: false
};

describe("AdditionalInputV2 + MetaFieldValuesV2 integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the field's real values via MetaFieldValuesV2", () => {
    render(
      <Formik initialValues={{ meta_fields: [baseItem] }} onSubmit={jest.fn()}>
        <Form>
          <AdditionalInputV2 {...defaultProps} item={baseItem} />
        </Form>
      </Formik>
    );

    expect(
      screen.getAllByPlaceholderText("meta_fields.placeholders.name")
    ).toHaveLength(2);
  });

  test("adding a value through MetaFieldValuesV2 updates meta_fields at the right fieldIndex", async () => {
    const TestWrapper = () => {
      const { values } = useFormikContext();
      const field = values.meta_fields[1];
      return (
        <>
          <AdditionalInputV2 {...defaultProps} item={field} itemIdx={1} />
          <div data-testid="values-count">{field.values.length}</div>
        </>
      );
    };

    const otherField = { ...baseItem, id: 2, name: "Size", values: [] };

    render(
      <Formik
        initialValues={{ meta_fields: [baseItem, otherField] }}
        onSubmit={jest.fn()}
      >
        <Form>
          <TestWrapper />
        </Form>
      </Formik>
    );

    expect(screen.getByTestId("values-count")).toHaveTextContent("0");

    await userEvent.click(screen.getByRole("button", { name: /add_value/i }));

    await waitFor(() => {
      expect(screen.getByTestId("values-count")).toHaveTextContent("1");
    });
  });

  test("removing a value confirms and calls onDeleteValue with entityId/field/value ids", async () => {
    showConfirmDialog.mockResolvedValue(true);
    const onDeleteValue = jest.fn().mockResolvedValue();

    render(
      <Formik initialValues={{ meta_fields: [baseItem] }} onSubmit={jest.fn()}>
        <Form>
          <AdditionalInputV2
            {...defaultProps}
            item={baseItem}
            onDeleteValue={onDeleteValue}
          />
        </Form>
      </Formik>
    );

    const closeButton = screen.getAllByTestId("CloseIcon")[0].closest("button");
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(onDeleteValue).toHaveBeenCalledWith(1, 1, 101);
    });
  });

  test("toggling is_default in MetaFieldValuesV2 keeps only one value default", async () => {
    render(
      <Formik initialValues={{ meta_fields: [baseItem] }} onSubmit={jest.fn()}>
        <Form>
          <AdditionalInputV2 {...defaultProps} item={baseItem} />
        </Form>
      </Formik>
    );

    const checkboxes = screen.getAllByRole("checkbox");
    // is_required checkbox is first, then the two value defaults
    const [redDefault, blueDefault] = checkboxes.slice(1);

    expect(blueDefault).toBeChecked();
    expect(redDefault).not.toBeChecked();

    await userEvent.click(redDefault);

    expect(redDefault).toBeChecked();
    expect(blueDefault).not.toBeChecked();
  });
});
