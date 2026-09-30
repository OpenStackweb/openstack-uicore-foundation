import CircleButton from "../../src/components/circle-button";

export default {
  title: "Core/Display/CircleButton",
  component: CircleButton,
  argTypes: {
    addToSchedule: { action: "addToSchedule" },
    removeFromSchedule: { action: "removeFromSchedule" },
    enterClick: { action: "enter" }
  }
};

// state is derived from event start/end vs nowUtc, all unix epochs
const NOW = 1750000000;
const liveEvent = { id: 1, start_date: NOW - 600, end_date: NOW + 3600 };
const futureEvent = { id: 2, start_date: NOW + 7200, end_date: NOW + 10800 };

export const LiveNow = { args: { event: liveEvent, nowUtc: NOW, isScheduled: false } };
export const AddToSchedule = { args: { event: futureEvent, nowUtc: NOW, isScheduled: false } };
export const Scheduled = { args: { event: futureEvent, nowUtc: NOW, isScheduled: true } };
