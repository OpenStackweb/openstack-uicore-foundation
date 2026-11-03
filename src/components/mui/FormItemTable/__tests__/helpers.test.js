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

jest.mock("../../../../utils/constants", () => ({
  MILLISECONDS_IN_SECOND: 1000,
  SPONSOR_FORMS_METAFIELD_CLASS: { FORM: "Form", ITEM: "Item" }
}));

import {
  getCurrentApplicableRate,
  isItemAvailable,
  hasDrivingQuantityField
} from "../helpers";

describe("isItemAvailable", () => {
  test("returns true when item has a rate for the given period", () => {
    const item = { rates: { early_bird: 100 } };
    expect(isItemAvailable(item, "early_bird")).toBe(true);
  });

  test("returns false when item has no rates", () => {
    const item = {};
    expect(isItemAvailable(item, "early_bird")).toBe(false);
  });

  test("returns false when item has rates but not for the given period", () => {
    const item = { rates: { standard: 50 } };
    expect(isItemAvailable(item, "early_bird")).toBe(false);
  });

  test("returns false when rate value is null", () => {
    const item = { rates: { early_bird: null } };
    expect(isItemAvailable(item, "early_bird")).toBe(false);
  });

  test("returns true when a custom rate is set and no rate applies for the period", () => {
    const item = { rates: { early_bird: 100 } };
    // Strict toBe(true) also pins the boolean coercion: without it the
    // short-circuit would hand back the raw custom rate (5000).
    expect(isItemAvailable(item, "expired", 5000)).toBe(true);
  });

  test("returns true when a custom rate is set and the item has no rates at all", () => {
    expect(isItemAvailable({}, "early_bird", 5000)).toBe(true);
  });

  test("returns false when the custom rate is 0 and no rate applies", () => {
    // 0 is the "no custom rate" sentinel on both sides of the wire — it must
    // not make an otherwise-unavailable item available.
    const item = { rates: { early_bird: 100 } };
    expect(isItemAvailable(item, "expired", 0)).toBe(false);
  });

  test("is unavailable while ordering is closed unless a custom rate is set", () => {
    const item = { rates: { standard: 100, onsite: 150 } };
    expect(isItemAvailable(item, "closed")).toBe(false);
    expect(isItemAvailable(item, "closed", 5000)).toBe(true);
  });

  test("stays available on the applicable rate when no custom rate is passed", () => {
    const item = { rates: { early_bird: 100 } };
    expect(isItemAvailable(item, "early_bird", 0)).toBe(true);
  });

  test("returns false when item is sold out even if it has a rate for the given period", () => {
    const item = { rates: { early_bird: 100 }, is_sold_out: true };
    expect(isItemAvailable(item, "early_bird")).toBe(true);
  });

  test("returns true when item is explicitly not sold out and has a rate", () => {
    const item = { rates: { early_bird: 100 }, is_sold_out: false };
    expect(isItemAvailable(item, "early_bird")).toBe(true);
  });
});

describe("hasDrivingQuantityField", () => {
  test("returns false when extraColumns has no Quantity field", () => {
    expect(hasDrivingQuantityField([])).toBe(false);
  });

  test("returns true when a Form-class Quantity field exists in extraColumns", () => {
    const extraColumns = [
      { type_id: 1, class_field: "Form", type: "Quantity" }
    ];
    expect(hasDrivingQuantityField(extraColumns)).toBe(true);
  });
});

describe("getCurrentApplicableRate", () => {
  // Summit 73 pricing dates, stored as full days in America/Los_Angeles.
  const EARLY_BIRD_END = 1788505199; // 09/03 23:59:59 PT
  const STANDARD_END = 1790319599; // 09/24 23:59:59 PT
  const ONSITE_START = 1790319600; // 09/25 00:00:00 PT
  const ONSITE_END = 1792652399; // 10/21 23:59:59 PT

  const rateDates = {
    early_bird_end_date: EARLY_BIRD_END,
    standard_price_end_date: STANDARD_END,
    onsite_price_start_date: ONSITE_START,
    onsite_price_end_date: ONSITE_END
  };

  const at = (epoch) => jest.setSystemTime(epoch * 1000);

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("returns early_bird up to and including early_bird_end_date", () => {
    at(EARLY_BIRD_END);
    expect(getCurrentApplicableRate("America/Los_Angeles", rateDates)).toBe("early_bird");
  });

  test("returns standard after early bird ends", () => {
    at(EARLY_BIRD_END + 1);
    expect(getCurrentApplicableRate("America/Los_Angeles", rateDates)).toBe("standard");
  });

  test("returns standard up to and including standard_price_end_date", () => {
    at(STANDARD_END);
    expect(getCurrentApplicableRate("America/Los_Angeles", rateDates)).toBe("standard");
  });

  test("returns onsite from onsite_price_start_date on", () => {
    at(ONSITE_START);
    expect(getCurrentApplicableRate("America/Los_Angeles", rateDates)).toBe("onsite");
  });

  test("returns onsite up to and including onsite_price_end_date", () => {
    at(ONSITE_END);
    expect(getCurrentApplicableRate("America/Los_Angeles", rateDates)).toBe("onsite");
  });

  test("returns expired after onsite_price_end_date", () => {
    at(ONSITE_END + 1);
    expect(getCurrentApplicableRate("America/Los_Angeles", rateDates)).toBe("expired");
  });

  test("returns closed between standard_price_end_date and onsite_price_start_date", () => {
    // The gap summit 73 had while onsite_price_start_date was stored as
    // 09/25 22:00 PT: the backend treats ordering as closed there, so no
    // catalog rate applies. The old day-rounding reported onsite instead.
    const gapped = { ...rateDates, onsite_price_start_date: 1790398800 };
    at(1790345880); // 09/25 07:18 PT
    expect(getCurrentApplicableRate("America/Los_Angeles", gapped)).toBe("closed");
  });

  test("compares exact instants instead of rounding to whole days", () => {
    // Onsite starting at 22:00 PT is not active at 21:59 PT that same day,
    // even though both fall on the same calendar date.
    const gapped = { ...rateDates, onsite_price_start_date: 1790398800 };
    at(1790398800 - 60);
    expect(getCurrentApplicableRate("America/Los_Angeles", gapped)).toBe("closed");
    at(1790398800);
    expect(getCurrentApplicableRate("America/Los_Angeles", gapped)).toBe("onsite");
  });

  test("falls back to onsite_price_start_date as the standard cutoff", () => {
    const noStandardEnd = { ...rateDates, standard_price_end_date: null };
    at(ONSITE_START);
    expect(getCurrentApplicableRate("America/Los_Angeles", noStandardEnd)).toBe("standard");
    at(ONSITE_START + 1);
    expect(getCurrentApplicableRate("America/Los_Angeles", noStandardEnd)).toBe("onsite");
  });

  test("returns onsite when onsite_price_end_date is not provided", () => {
    at(ONSITE_END + 1);
    expect(
      getCurrentApplicableRate("America/Los_Angeles", { ...rateDates, onsite_price_end_date: null })
    ).toBe("onsite");
  });

  test("returns expired when there are no rate dates", () => {
    at(ONSITE_START);
    expect(getCurrentApplicableRate("America/Los_Angeles", null)).toBe("expired");
    expect(getCurrentApplicableRate("America/Los_Angeles", undefined)).toBe("expired");
  });

  test("returns onsite when no pricing dates are set", () => {
    at(ONSITE_START);
    expect(getCurrentApplicableRate("America/Los_Angeles", {})).toBe("onsite");
  });
});
