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
  querySponsorAddons: jest.fn((summitId, sponsorId, sponsorshipIds, callback) => {
    callback([
      { id: 1, name: "Addon A" },
      { id: 2, name: "Addon B" }
    ]);
  })
}));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SponsorAddonSelect from "../sponsor-addon-select";

describe("SponsorAddonSelect", () => {
  const defaultProps = {
    value: null,
    summitId: 1,
    sponsor: { id: 10, sponsorships: [{ id: 100 }, { id: 101 }] },
    onChange: jest.fn(),
    placeholder: "Select addon..."
  };

  beforeEach(() => jest.clearAllMocks());

  test("renders without errors", () => {
    const { container } = render(<SponsorAddonSelect {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test("calls querySponsorAddons on mount with correct args", async () => {
    render(<SponsorAddonSelect {...defaultProps} />);
    await waitFor(() => {
      expect(
        require("../../../utils/query-actions").querySponsorAddons
      ).toHaveBeenCalledWith(1, 10, [100, 101], expect.any(Function));
    });
  });

  test("renders a select combobox", () => {
    const { container } = render(<SponsorAddonSelect {...defaultProps} />);
    expect(container.querySelector("[role='combobox']")).toBeInTheDocument();
  });
});
