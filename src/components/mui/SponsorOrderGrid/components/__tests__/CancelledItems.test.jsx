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
  default: { translate: (key, params) => `${key}(${JSON.stringify(params)})` }
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CancelledItems from "../CancelledItems";

describe("CancelledItems", () => {
  test("renders nothing when cancelledItems is empty", () => {
    const { container } = render(<CancelledItems cancelledItems={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders a link for each cancelled item", () => {
    const items = [
      { id: 1, formCode: "GOLD", itemCode: "BOOTH" },
      { id: 2, formCode: "SILVER", itemCode: "TABLE" }
    ];
    render(<CancelledItems cancelledItems={items} />);
    expect(screen.getByText("GOLD - BOOTH")).toBeInTheDocument();
    expect(screen.getByText("SILVER - TABLE")).toBeInTheDocument();
  });

  test("each link href anchors to the item id", () => {
    const items = [{ id: 42, formCode: "G", itemCode: "B" }];
    render(<CancelledItems cancelledItems={items} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "#item-42");
  });

  test("item count is shown in the label", () => {
    const items = [
      { id: 1, formCode: "A", itemCode: "X" },
      { id: 2, formCode: "B", itemCode: "Y" }
    ];
    render(<CancelledItems cancelledItems={items} />);
    expect(screen.getByText(/cancelled_items/)).toBeInTheDocument();
  });
});
