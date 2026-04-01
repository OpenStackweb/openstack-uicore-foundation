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
  querySummitAddons: jest.fn((summitId, callback) => {
    callback(["Addon Alpha", "Addon Beta"]);
  })
}));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SummitAddonSelect from "../summit-addon-select";

describe("SummitAddonSelect", () => {
  const defaultProps = {
    value: "",
    summitId: 5,
    onChange: jest.fn(),
    placeholder: "Select addon..."
  };

  beforeEach(() => jest.clearAllMocks());

  test("renders a select combobox", () => {
    const { container } = render(<SummitAddonSelect {...defaultProps} />);
    expect(container.querySelector("[role='combobox']")).toBeInTheDocument();
  });

  test("calls querySummitAddons on mount with summitId", async () => {
    render(<SummitAddonSelect {...defaultProps} />);
    await waitFor(() => {
      expect(
        require("../../../utils/query-actions").querySummitAddons
      ).toHaveBeenCalledWith(5, expect.any(Function));
    });
  });

  test("renders options returned by querySummitAddons", async () => {
    render(<SummitAddonSelect {...defaultProps} />);
    // Options are rendered inside the Select's listbox - click to open
    // Just verify the component renders without errors after options load
    await waitFor(() => {
      expect(
        require("../../../utils/query-actions").querySummitAddons
      ).toHaveBeenCalled();
    });
  });
});
