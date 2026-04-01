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
  querySponsorshipsBySummit: jest.fn((input, summitId, callback) => {
    callback([
      { id: 1, type: { name: "Gold" } },
      { id: 2, type: { name: "Silver" } }
    ]);
    return Promise.resolve();
  })
}));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import SponsorshipsBySummitSelectMUI from "../formik-inputs/sponsorship-summit-select-mui";

const renderWithFormik = (props, initialValues = { sponsorships: [] }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <SponsorshipsBySummitSelectMUI
          name="sponsorships"
          summitId={1}
          placeholder="Select sponsorships..."
          {...props}
        />
      </Form>
    </Formik>
  );

describe("SponsorshipsBySummitSelectMUI", () => {
  beforeEach(() => jest.clearAllMocks());

  test("renders without errors", () => {
    const { container } = renderWithFormik({});
    expect(container.firstChild).toBeInTheDocument();
  });

  test("shows placeholder when no value selected", () => {
    renderWithFormik({});
    expect(screen.getByText("Select sponsorships...")).toBeInTheDocument();
  });

  test("fetches sponsorships by summit on mount", async () => {
    renderWithFormik({});
    await waitFor(() => {
      expect(
        require("../../../utils/query-actions").querySponsorshipsBySummit
      ).toHaveBeenCalledWith("", 1, expect.any(Function));
    });
  });

  test("shows error when touched and has error", () => {
    render(
      <Formik
        initialValues={{ sponsorships: [] }}
        initialErrors={{ sponsorships: "Required" }}
        initialTouched={{ sponsorships: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <SponsorshipsBySummitSelectMUI
            name="sponsorships"
            summitId={1}
            placeholder="Select..."
          />
        </Form>
      </Formik>
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
