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
 **/

jest.mock("../datetimepicker/datetimepicker.less", () => ({}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import moment from "moment-timezone";
import DateTimePicker from "../datetimepicker";

const TZ = "America/New_York";
const FORMAT = { date: "YYYY-MM-DD", time: "HH:mm" };

const renderPicker = (props = {}) =>
  render(
    <DateTimePicker
      id="start_date"
      format={FORMAT}
      timezone={TZ}
      onChange={jest.fn()}
      {...props}
    />
  );

const openPicker = (container) =>
  fireEvent.focus(container.querySelector("input#start_date"));

const day = (container, n) =>
  container.querySelector(`td.rdtDay[data-value="${n}"]:not(.rdtOld):not(.rdtNew)`);

describe("DateTimePicker", () => {
  test("renders the value in the given format, with the input id", () => {
    const { container } = renderPicker({
      value: moment.tz("2026-03-15 10:30", TZ)
    });
    const input = container.querySelector("input#start_date");
    expect(input).toHaveValue("2026-03-15 10:30");
    expect(input).toHaveClass("form-control");
    expect(input).toHaveAttribute("autocomplete", "off");
  });

  test("shows the error label and error class", () => {
    const { container } = renderPicker({ error: "Required" });
    expect(screen.getByText("Required")).toHaveClass("error-label");
    expect(container.querySelector("input#start_date")).toHaveClass("error");
  });

  test("disables the input", () => {
    const { container } = renderPicker({ disabled: true });
    expect(container.querySelector("input#start_date")).toBeDisabled();
  });

  test("calls onChange with a moment in the given time zone when a day is picked", () => {
    const onChange = jest.fn();
    const { container } = renderPicker({
      onChange,
      value: moment.tz("2026-03-15 10:30", TZ)
    });

    openPicker(container);
    fireEvent.click(day(container, 20));

    expect(onChange).toHaveBeenCalledTimes(1);
    const { target } = onChange.mock.calls[0][0];
    expect(target.id).toBe("start_date");
    expect(target.type).toBe("datetime");
    expect(target.value.tz()).toBe(TZ);
    expect(target.value.format("YYYY-MM-DD HH:mm")).toBe("2026-03-20 10:30");
  });

  test("disables days outside the validation range", () => {
    const { container } = renderPicker({
      value: moment.tz("2026-03-15 10:30", TZ),
      validation: {
        after: moment.tz("2026-03-10", TZ).unix(),
        before: moment.tz("2026-03-20", TZ).unix()
      }
    });

    openPicker(container);

    expect(day(container, 5)).toHaveClass("rdtDisabled");
    expect(day(container, 15)).not.toHaveClass("rdtDisabled");
    expect(day(container, 25)).toHaveClass("rdtDisabled");
  });

  test("shows defaultValue when there is no value", () => {
    const { container } = renderPicker({
      defaultValue: moment.tz("2026-05-02 08:00", TZ)
    });
    expect(container.querySelector("input#start_date")).toHaveValue("2026-05-02 08:00");
  });

  test("opens on the month given by viewDate when there is no value", () => {
    const { container } = renderPicker({
      viewDate: moment.tz("2026-07-01", TZ)
    });

    openPicker(container);

    expect(container.querySelector(".rdtSwitch")).toHaveTextContent("July 2026");
  });
});
