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
import moment from "moment-timezone";
import DateTimeInput from "../DateTimeInput";

jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

let mockPickerProps;
jest.mock("@mui/x-date-pickers/DateTimePicker", () => ({
  DateTimePicker: (props) => {
    mockPickerProps = props;
    return null;
  }
}));
jest.mock("@mui/x-date-pickers/LocalizationProvider", () => ({
  LocalizationProvider: ({ children }) => children
}));
jest.mock("@mui/x-date-pickers/AdapterMoment", () => ({
  AdapterMoment: function AdapterMoment() {}
}));

// Admin's browser runs in Buenos Aires (UTC-3); the summit lives in Chicago (UTC-5 in July).
const BROWSER_TZ = "America/Argentina/Buenos_Aires";
const SUMMIT_TZ = "America/Chicago";

describe("DateTimeInput – summit-timezone contract", () => {
  beforeAll(() => moment.tz.setDefault(BROWSER_TZ));
  afterAll(() => moment.tz.setDefault());

  test("displays a stored epoch as summit wall-clock time", () => {
    // epoch for 07/06/2026 10:00 AM Chicago
    const epoch = moment
      .tz("2026-07-06 10:00", "YYYY-MM-DD HH:mm", SUMMIT_TZ)
      .unix();

    render(
      <DateTimeInput
        id="dt"
        value={epoch}
        timezone={SUMMIT_TZ}
        onChange={jest.fn()}
      />
    );

    expect(mockPickerProps.value.format("MM/DD/YYYY hh:mm A")).toBe(
      "07/06/2026 10:00 AM"
    );
  });

  test("emits the summit-time epoch for a picked wall-clock", () => {
    const onChange = jest.fn();
    render(
      <DateTimeInput
        id="dt"
        value={null}
        timezone={SUMMIT_TZ}
        onChange={onChange}
      />
    );

    // the picker hands back the picked wall-clock in its display zone —
    // browser-local, since no timezone handling reaches it
    mockPickerProps.onChange(moment("2026-07-06 10:00", "YYYY-MM-DD HH:mm"));

    const expected = moment
      .tz("2026-07-06 10:00", "YYYY-MM-DD HH:mm", SUMMIT_TZ)
      .unix();
    expect(onChange).toHaveBeenCalledWith({ target: { value: expected } });
  });

  test("keeps browser-local behavior when no timezone prop is given", () => {
    const onChange = jest.fn();
    const epoch = moment.tz("2026-07-06 10:00", "YYYY-MM-DD HH:mm", BROWSER_TZ).unix();

    render(<DateTimeInput id="dt" value={epoch} onChange={onChange} />);

    expect(mockPickerProps.value.format("MM/DD/YYYY hh:mm A")).toBe(
      "07/06/2026 10:00 AM"
    );

    mockPickerProps.onChange(moment("2026-07-06 11:00", "YYYY-MM-DD HH:mm"));
    const expected = moment
      .tz("2026-07-06 11:00", "YYYY-MM-DD HH:mm", BROWSER_TZ)
      .unix();
    expect(onChange).toHaveBeenCalledWith({ target: { value: expected } });
  });

  test("emits null when the picker is cleared", () => {
    const onChange = jest.fn();
    render(
      <DateTimeInput
        id="dt"
        value={null}
        timezone={SUMMIT_TZ}
        onChange={onChange}
      />
    );

    mockPickerProps.onChange(null);

    expect(onChange).toHaveBeenCalledWith({ target: { value: null } });
  });
});
