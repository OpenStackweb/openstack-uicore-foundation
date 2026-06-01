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

jest.mock("../../inputs/upload-input-v3", () => {
  const React = require("react");
  const MockUploadInputV3 = ({ value = [], canAdd = true, onRemove }) => (
    <div data-testid="upload-input" data-can-add={canAdd}>
      {value.length} file(s)
      {value.map((file, index) => (
        <button
          key={index}
          data-testid={`remove-${index}`}
          onClick={() => onRemove && onRemove(file)}
        >
          Remove
        </button>
      ))}
    </div>
  );
  return { __esModule: true, default: MockUploadInputV3 };
});

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik, Form, useFormikContext } from "formik";
import "@testing-library/jest-dom";
import MuiFormikUpload from "../formik-inputs/mui-formik-upload";

const ValuesDisplay = () => {
  const { values } = useFormikContext();
  return <div data-testid="values">{JSON.stringify(values)}</div>;
};

const renderWithFormik = (props, initialValues = { images: [] }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikUpload name="images" id="images-upload" {...props} />
        <ValuesDisplay />
      </Form>
    </Formik>
  );

describe("MuiFormikUpload", () => {
  test("renders the upload input component", () => {
    renderWithFormik({});
    expect(screen.getByTestId("upload-input")).toBeInTheDocument();
  });

  test("shows 0 files when initial value is empty", () => {
    renderWithFormik({});
    expect(screen.getByText("0 file(s)")).toBeInTheDocument();
  });

  test("shows file count matching initial value", () => {
    const images = [
      { id: 1, file_name: "a.jpg" },
      { id: 2, file_name: "b.jpg" }
    ];
    renderWithFormik({}, { images });
    expect(screen.getByText("2 file(s)")).toBeInTheDocument();
  });

  test("canAdd is true when file count is below maxFiles", () => {
    renderWithFormik({ maxFiles: 5 }, { images: [] });
    expect(screen.getByTestId("upload-input")).toHaveAttribute(
      "data-can-add",
      "true"
    );
  });

  test("canAdd is false when file count equals maxFiles", () => {
    const images = [{ id: 1 }, { id: 2 }];
    renderWithFormik({ maxFiles: 2 }, { images });
    expect(screen.getByTestId("upload-input")).toHaveAttribute(
      "data-can-add",
      "false"
    );
  });

  test("shows error when touched and has error", () => {
    render(
      <Formik
        initialValues={{ images: [] }}
        initialErrors={{ images: "Required" }}
        initialTouched={{ images: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikUpload name="images" id="images-upload" />
        </Form>
      </Formik>
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  describe("handleRemove", () => {
    test("removes only the clicked file when stored items have file_name", async () => {
      const images = [
        { id: 1, file_name: "a.jpg" },
        { id: 2, file_name: "b.jpg" }
      ];
      renderWithFormik({}, { images });

      await userEvent.click(screen.getByTestId("remove-0"));

      const values = JSON.parse(screen.getByTestId("values").textContent);
      expect(values.images).toHaveLength(1);
      expect(values.images[0].file_name).toBe("b.jpg");
    });

    test("removes only the clicked file when stored items have only file_url", async () => {
      const images = [
        { id: 1, file_url: "https://example.com/a.jpg" },
        { id: 2, file_url: "https://example.com/b.jpg" },
        { id: 3, file_url: "https://example.com/c.jpg" }
      ];
      renderWithFormik({}, { images });

      await userEvent.click(screen.getByTestId("remove-0"));

      const values = JSON.parse(screen.getByTestId("values").textContent);
      expect(values.images).toHaveLength(2);
      expect(values.images.find((i) => i.id === 1)).toBeUndefined();
      expect(values.images.find((i) => i.id === 2)).toBeDefined();
      expect(values.images.find((i) => i.id === 3)).toBeDefined();
    });

    test("removes only the clicked file when stored items have file_path", async () => {
      const images = [
        { id: 1, file_path: "/uploads/a.pdf" },
        { id: 2, file_path: "/uploads/b.pdf" }
      ];
      renderWithFormik({}, { images });

      await userEvent.click(screen.getByTestId("remove-1"));

      const values = JSON.parse(screen.getByTestId("values").textContent);
      expect(values.images).toHaveLength(1);
      expect(values.images[0].file_path).toBe("/uploads/a.pdf");
    });

    test("calls onDelete with the removed file id", async () => {
      const onDelete = jest.fn();
      const images = [{ id: 42, file_name: "photo.jpg" }];
      renderWithFormik({ onDelete }, { images });

      await userEvent.click(screen.getByTestId("remove-0"));

      expect(onDelete).toHaveBeenCalledWith(42);
    });

    test("does not call onDelete when prop is not provided", async () => {
      const images = [{ id: 1, file_name: "photo.jpg" }];
      renderWithFormik({}, { images });

      await expect(
        userEvent.click(screen.getByTestId("remove-0"))
      ).resolves.not.toThrow();
    });
  });
});
