import moment from "moment-timezone";
import DateTimePicker from "../../src/components/inputs/datetimepicker";

export default {
  title: "Core/Inputs/DateTimePicker",
  component: DateTimePicker,
  argTypes: { onChange: { action: "changed" } }
};

export const Default = {
  args: {
    id: "start_date",
    value: moment.tz("2026-06-15 10:00", "UTC"),
    format: { date: "YYYY-MM-DD", time: "HH:mm" },
    timezone: "UTC"
  }
};

export const DateOnly = {
  args: {
    id: "end_date",
    value: moment.tz("2026-06-18", "UTC"),
    format: { date: "YYYY-MM-DD", time: false },
    timezone: "UTC"
  }
};
