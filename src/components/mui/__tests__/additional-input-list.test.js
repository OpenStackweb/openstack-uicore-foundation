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
import AdditionalInputList from "../formik-inputs/additional-input/additional-input-list";
import AdditionalInput from "../formik-inputs/additional-input/additional-input";

jest.mock("../formik-inputs/additional-input/additional-input-list-core", () =>
  function MockAdditionalInputListCore({ AdditionalInputComponent }) {
    return (
      <div data-testid="input-component-name">
        {AdditionalInputComponent.name}
      </div>
    );
  }
);

describe("AdditionalInputList (v1 entry point)", () => {
  test("wires the @hello-pangea/dnd based AdditionalInput into the core list", () => {
    render(<AdditionalInputList />);

    expect(screen.getByTestId("input-component-name")).toHaveTextContent(
      AdditionalInput.name
    );
  });
});
