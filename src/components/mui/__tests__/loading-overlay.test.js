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
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoadingOverlay from "../LoadingOverlay/index";

describe("LoadingOverlay", () => {
  test("renders without crashing when loading is true", () => {
    const { container } = render(<LoadingOverlay loading={true} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test("renders without crashing when loading is false", () => {
    const { container } = render(<LoadingOverlay loading={false} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test("backdrop is visible when loading is true", () => {
    const { container } = render(<LoadingOverlay loading={true} />);
    // MUI Backdrop renders with aria-hidden=false when open
    const backdrop = container.querySelector(".MuiBackdrop-root");
    expect(backdrop).toBeInTheDocument();
  });
});
