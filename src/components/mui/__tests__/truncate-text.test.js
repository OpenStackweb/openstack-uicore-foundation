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
import TruncateText from "../truncate-text";

describe("TruncateText", () => {
  let scrollWidthSpy;
  let offsetWidthSpy;

  beforeEach(() => {
    scrollWidthSpy = jest.spyOn(Element.prototype, "scrollWidth", "get").mockReturnValue(0);
    offsetWidthSpy = jest.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("css mode (charLimit={true})", () => {
    test("wrapper span has truncation styles", () => {
      render(<TruncateText charLimit={true}>content</TruncateText>);
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

      render(<TruncateText charLimit={true}>really long content</TruncateText>);
      await userEvent.hover(screen.getByText("really long content").parentElement);

      expect(await screen.findByRole("tooltip")).toHaveTextContent("really long content");
    });

    test("does not show tooltip when content fits", async () => {
      render(<TruncateText charLimit={true}>short</TruncateText>);
      await userEvent.hover(screen.getByText("short").parentElement);

      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  describe("character limit mode (charLimit={number})", () => {
    test("truncates display and shows full content in tooltip when beyond charLimit", async () => {
      render(<TruncateText charLimit={5}>Hello World</TruncateText>);
      expect(screen.getByText("Hello...")).toBeInTheDocument();

      await userEvent.hover(screen.getByText("Hello...").parentElement);
      expect(await screen.findByRole("tooltip")).toHaveTextContent("Hello World");
    });

    test("renders content unchanged and shows no tooltip when within charLimit", async () => {
      render(<TruncateText charLimit={20}>short text</TruncateText>);
      expect(screen.getByText("short text")).toBeInTheDocument();

      await userEvent.hover(screen.getByText("short text").parentElement);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });
});
