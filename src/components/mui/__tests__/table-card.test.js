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
import TableCard from "../cards/TableCard";

const columns = [
  { key: "name", label: "Name" },
  { key: "qty", label: "Qty" }
];

const rows = [
  { name: "Alpha", qty: 1 },
  { name: "Beta", qty: 2 }
];

describe("TableCard", () => {
  test("renders the title", () => {
    render(<TableCard title="My Table" columns={columns} rows={rows} />);
    expect(screen.getByText("My Table")).toBeInTheDocument();
  });

  test("renders column headers", () => {
    render(<TableCard title="T" columns={columns} rows={rows} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Qty")).toBeInTheDocument();
  });

  test("renders row values", () => {
    render(<TableCard title="T" columns={columns} rows={rows} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("renders empty rows without crashing", () => {
    render(<TableCard title="Empty" columns={columns} rows={[]} />);
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  test("renders empty columns without crashing", () => {
    render(<TableCard title="NoColumns" columns={[]} rows={rows} />);
    expect(screen.getByText("NoColumns")).toBeInTheDocument();
  });
});
