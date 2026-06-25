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
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import EllipsisTooltip from "../ellipsis-tooltip";

describe("EllipsisTooltip", () => {
  let scrollWidthSpy;
  let offsetWidthSpy;

  beforeEach(() => {
    scrollWidthSpy = jest.spyOn(Element.prototype, "scrollWidth", "get").mockReturnValue(0);
    offsetWidthSpy = jest.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders children", () => {
    render(<EllipsisTooltip><span>content</span></EllipsisTooltip>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  test("wrapper span has truncation styles", () => {
    render(<EllipsisTooltip><span>content</span></EllipsisTooltip>);
    const wrapper = screen.getByText("content").parentElement;
    expect(wrapper).toHaveStyle({
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    });
  });

  test("shows tooltip on hover when content overflows", async () => {
    scrollWidthSpy.mockReturnValue(200);
    offsetWidthSpy.mockReturnValue(100);

    render(<EllipsisTooltip><span>long content</span></EllipsisTooltip>);
    await userEvent.hover(screen.getByText("long content").parentElement);

    expect(await screen.findByRole("tooltip")).toHaveTextContent("long content");
  });

  test("does not show tooltip when content fits", async () => {
    // scrollWidth (0) <= offsetWidth (0) → not overflowing
    render(<EllipsisTooltip><span>short</span></EllipsisTooltip>);
    await userEvent.hover(screen.getByText("short").parentElement);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
