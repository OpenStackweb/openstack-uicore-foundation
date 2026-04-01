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

jest.mock("../../../utils/query-actions", () => ({
  querySponsorships: jest.fn()
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import SponsorshipTypeInputMUI from "../formik-inputs/sponsorship-input-mui";

const renderWithFormik = (props, initialValues = { sponsorship: null }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <SponsorshipTypeInputMUI
          name="sponsorship"
          placeholder="Search sponsorships..."
          {...props}
        />
      </Form>
    </Formik>
  );

describe("SponsorshipTypeInputMUI", () => {
  beforeEach(() => jest.clearAllMocks());

  test("renders with placeholder", () => {
    renderWithFormik({});
    expect(
      screen.getByPlaceholderText("Search sponsorships...")
    ).toBeInTheDocument();
  });

  test("renders with preselected single value", () => {
    renderWithFormik(
      {},
      { sponsorship: { id: 1, name: "Gold Sponsor" } }
    );
    expect(screen.getByDisplayValue("Gold Sponsor")).toBeInTheDocument();
  });

  test("renders with multiple preselected values", () => {
    renderWithFormik(
      { isMulti: true },
      {
        sponsorship: [
          { id: 1, name: "Gold Sponsor" },
          { id: 2, name: "Silver Sponsor" }
        ]
      }
    );
    expect(screen.getByText("Gold Sponsor")).toBeInTheDocument();
    expect(screen.getByText("Silver Sponsor")).toBeInTheDocument();
  });

  test("shows error when touched and has error", () => {
    render(
      <Formik
        initialValues={{ sponsorship: null }}
        initialErrors={{ sponsorship: "Required" }}
        initialTouched={{ sponsorship: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <SponsorshipTypeInputMUI name="sponsorship" placeholder="Search..." />
        </Form>
      </Formik>
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
