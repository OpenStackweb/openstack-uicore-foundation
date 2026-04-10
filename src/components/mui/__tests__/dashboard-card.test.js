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
import "@testing-library/jest-dom";
import DashboardCard from "../DashboardCard/index";

describe("DashboardCard", () => {
  test("renders the title", () => {
    render(<DashboardCard title="My Card" rows={[]} />);
    expect(screen.getByText("My Card")).toBeInTheDocument();
  });

  test("renders rows in list mode", () => {
    const rows = [
      { label: "Name", value: "Alice" },
      { label: "Role", value: "Admin" }
    ];
    render(<DashboardCard title="Info" rows={rows} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  test("renders table mode with columns", () => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "score", label: "Score" }
    ];
    const rows = [{ name: "Bob", score: "100" }];
    render(<DashboardCard title="Table" rows={rows} columns={columns} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  test("renders multiple rows in table mode", () => {
    const columns = [{ key: "item", label: "Item" }];
    const rows = [{ item: "First" }, { item: "Second" }];
    render(<DashboardCard title="List" rows={rows} columns={columns} />);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
