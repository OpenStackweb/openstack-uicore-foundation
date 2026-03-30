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
  default: { translate: (key) => key }
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import UnderlyingAlertNote from "../components/UnderlyingAlertNote";

describe("UnderlyingAlertNote", () => {
  test("renders null when showAdditionalItems is false", () => {
    const { container } = render(
      <UnderlyingAlertNote showAdditionalItems={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders alert text when showAdditionalItems is true", () => {
    render(<UnderlyingAlertNote showAdditionalItems={true} />);
    expect(
      screen.getByText("sponsor_edit_form.additional_info")
    ).toBeInTheDocument();
  });
});
