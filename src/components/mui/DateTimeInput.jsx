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
import PropTypes from "prop-types";
import T from "i18n-react/dist/i18n-react";
import moment from "moment-timezone";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

// mode controls which views the single DateTimePicker exposes, keeping the
// stored value a unix timestamp (the convention used across this app) in
// every case, regardless of whether the user picks a date, a time, or both.
const MODE_VIEWS = {
  date: ["year", "month", "day"],
  time: ["hours", "minutes"],
  datetime: ["year", "month", "day", "hours", "minutes"]
};

const MODE_FORMATS = {
  date: "MM/DD/YYYY",
  time: "hh:mm A",
  datetime: "MM/DD/YYYY hh:mm A"
};

const DateTimeInput = ({
  id,
  value,
  mode,
  label,
  placeholder,
  disabled,
  timezone,
  onChange,
  ...rest
}) => {
  // value is always a unix timestamp, which carries no timezone of its own —
  // moment.unix() alone renders it in the browser's local zone. Re-anchor it
  // in `timezone` (the summit's zone, typically) so the picker displays and
  // edits the same wall-clock time the summit sees, regardless of where the
  // admin's browser happens to be.
  const momentValue = value
    ? timezone
      ? moment.unix(value).tz(timezone)
      : moment.unix(value)
    : null;
  const finalPlaceholder =
    placeholder || T.translate("placeholders.date");

  const handleChange = (newValue) => {
    if (!newValue?.isValid()) {
      onChange({ target: { value: null } });
      return;
    }
    // The picker has no notion of `timezone` — it hands back a plain
    // wall-clock reading. Re-interpret that same reading as belonging to
    // `timezone` (rather than the instant it'd represent in the browser's
    // local zone) before converting to an epoch.
    const zonedValue = timezone
      ? moment.tz(newValue.format("YYYY-MM-DD HH:mm:ss"), timezone)
      : newValue;
    onChange({ target: { value: zonedValue.unix() } });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DateTimePicker
        value={momentValue}
        onChange={handleChange}
        views={MODE_VIEWS[mode] || MODE_VIEWS.datetime}
        format={MODE_FORMATS[mode] || MODE_FORMATS.datetime}
        disabled={disabled}
        label={label}
        slotProps={{
          textField: {
            id,
            placeholder: finalPlaceholder,
            fullWidth: true,
            size: "small"
          }
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
      />
    </LocalizationProvider>
  );
};

DateTimeInput.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.number,
  mode: PropTypes.oneOf(["date", "time", "datetime"]),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  // IANA zone name (e.g. a summit's time_zone_id) the value is displayed/
  // edited in. Omit to keep the browser's local zone (previous behavior).
  timezone: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

DateTimeInput.defaultProps = {
  value: null,
  mode: "datetime",
  label: "",
  placeholder: "",
  disabled: false,
  timezone: null
};

export default DateTimeInput;
