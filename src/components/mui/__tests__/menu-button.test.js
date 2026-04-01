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
import MenuButton from "../menu-button";

describe("MenuButton", () => {
  const menuItems = [
    { label: "Edit", onClick: jest.fn() },
    { label: "Delete", onClick: jest.fn() }
  ];

  beforeEach(() => jest.clearAllMocks());

  test("renders button with children text", () => {
    render(
      <MenuButton buttonId="btn" menuId="menu" menuItems={menuItems}>
        Options
      </MenuButton>
    );
    expect(screen.getByText("Options")).toBeInTheDocument();
  });

  test("menu is not visible before clicking", () => {
    render(
      <MenuButton buttonId="btn" menuId="menu" menuItems={menuItems}>
        Options
      </MenuButton>
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  test("clicking button opens the menu with items", async () => {
    render(
      <MenuButton buttonId="btn" menuId="menu" menuItems={menuItems}>
        Options
      </MenuButton>
    );
    await userEvent.click(screen.getByText("Options"));
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  test("clicking a menu item calls its onClick handler", async () => {
    const onEdit = jest.fn();
    const items = [{ label: "Edit", onClick: onEdit }];
    render(
      <MenuButton buttonId="btn" menuId="menu" menuItems={items}>
        Options
      </MenuButton>
    );
    await userEvent.click(screen.getByText("Options"));
    await userEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalled();
  });

  test("renders with badge when hasBadge is true", () => {
    render(
      <MenuButton buttonId="btn" menuId="menu" menuItems={menuItems} hasBadge>
        Filters
      </MenuButton>
    );
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });
});
