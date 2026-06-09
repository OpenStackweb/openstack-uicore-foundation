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

jest.mock("../../../../../utils/constants", () => ({
  ...jest.requireActual("../../../../../utils/constants")
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransactionType from "../TransactionType";
import { SPONSOR_ORDER_GRID_ITEM_TYPES } from "../../../../../utils/constants";

describe("TransactionType", () => {
  test("renders null for an unknown type", () => {
    const { container } = render(<TransactionType type="UNKNOWN_TYPE" />);
    expect(container.firstChild).toBeNull();
  });

  test("renders null when type is undefined", () => {
    const { container } = render(<TransactionType />);
    expect(container.firstChild).toBeNull();
  });

  test("renders children text when type is known", () => {
    render(
      <TransactionType type={SPONSOR_ORDER_GRID_ITEM_TYPES.CHARGE}>
        Charge label
      </TransactionType>
    );
    expect(screen.getByText("Charge label")).toBeInTheDocument();
  });

  test("falls back to rendering the type string when no children provided", () => {
    render(<TransactionType type={SPONSOR_ORDER_GRID_ITEM_TYPES.PAYMENT} />);
    expect(screen.getByText(SPONSOR_ORDER_GRID_ITEM_TYPES.PAYMENT)).toBeInTheDocument();
  });

  test("renders for every known type without crashing", () => {
    Object.values(SPONSOR_ORDER_GRID_ITEM_TYPES).forEach((type) => {
      const { unmount } = render(<TransactionType type={type} />);
      unmount();
    });
  });
});
