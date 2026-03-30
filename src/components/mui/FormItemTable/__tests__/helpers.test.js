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

const mockMoment = (isSameOrBeforeFn) => ({
  isSameOrBefore: isSameOrBeforeFn,
  endOf: () => ({ isSameOrBefore: isSameOrBeforeFn }),
  startOf: () => ({ isSameOrBefore: isSameOrBeforeFn })
});

jest.mock("../../../../utils/methods", () => ({
  epochToMomentTimeZone: jest.fn()
}));

jest.mock("../../../../utils/constants", () => ({
  MILLISECONDS_IN_SECOND: 1000
}));

import { epochToMomentTimeZone } from "../../../../utils/methods";
import {
  getCurrentApplicableRate,
  isItemAvailable
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
});

describe("getCurrentApplicableRate", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns early_bird when now is before earlyBirdEnd", () => {
    const nowMoment = mockMoment((other) => true);
    epochToMomentTimeZone.mockReturnValue(nowMoment);

    const result = getCurrentApplicableRate("UTC", {
      early_bird_end_date: 1000,
      onsite_price_start_date: 2000,
      onsite_price_end_date: 3000
    });
    expect(result).toBe("early_bird");
  });

  test("returns standard when past earlyBird but before onsiteStart", () => {
    let calls = 0;
    const nowMock = {
      isSameOrBefore: jest
        .fn()
        .mockReturnValueOnce(false) // not before earlyBirdEnd
        .mockReturnValueOnce(true) // before onsiteStart
    };
    epochToMomentTimeZone.mockImplementation(() => {
      calls++;
      if (calls === 1) return nowMock;
      if (calls === 2) return { endOf: () => ({}) }; // earlyBirdEnd (truthy)
      if (calls === 3) return { startOf: () => ({}) }; // onsiteStart (truthy)
      if (calls === 4) return { endOf: () => ({}) }; // onsiteEnd (not reached)
      return null;
    });

    const result = getCurrentApplicableRate("UTC", {
      early_bird_end_date: 1000,
      onsite_price_start_date: 2000,
      onsite_price_end_date: 3000
    });
    expect(result).toBe("standard");
  });

  test("returns onsite when in onsite period", () => {
    let calls = 0;
    const nowMock = {
      isSameOrBefore: jest
        .fn()
        .mockReturnValueOnce(false) // not before earlyBirdEnd
        .mockReturnValueOnce(false) // not before onsiteStart
        .mockReturnValueOnce(true) // before onsiteEnd
    };
    epochToMomentTimeZone.mockImplementation(() => {
      calls++;
      if (calls === 1) return nowMock;
      if (calls === 2) return { endOf: () => ({}) }; // earlyBirdEnd (truthy)
      if (calls === 3) return { startOf: () => ({}) }; // onsiteStart (truthy)
      if (calls === 4) return { endOf: () => ({}) }; // onsiteEnd (truthy)
      return null;
    });

    const result = getCurrentApplicableRate("UTC", {
      early_bird_end_date: 1000,
      onsite_price_start_date: 2000,
      onsite_price_end_date: 3000
    });
    expect(result).toBe("onsite");
  });

  test("returns expired when all dates are past", () => {
    let calls = 0;
    epochToMomentTimeZone.mockImplementation(() => {
      calls++;
      if (calls === 1) return { isSameOrBefore: () => false };
      if (calls === 2) return { endOf: () => ({ isSameOrBefore: () => false }) };
      if (calls === 3) return { startOf: () => ({ isSameOrBefore: () => false }) };
      if (calls === 4) return { endOf: () => ({ isSameOrBefore: () => false }) };
      return null;
    });

    const result = getCurrentApplicableRate("UTC", {
      early_bird_end_date: 1000,
      onsite_price_start_date: 2000,
      onsite_price_end_date: 3000
    });
    expect(result).toBe("expired");
  });

  test("returns onsite when onsiteEnd is not provided", () => {
    let calls = 0;
    epochToMomentTimeZone.mockImplementation(() => {
      calls++;
      if (calls === 1) return { isSameOrBefore: () => false };
      if (calls === 2) return { endOf: () => ({ isSameOrBefore: () => false }) };
      if (calls === 3) return { startOf: () => ({ isSameOrBefore: () => false }) };
      if (calls === 4) return null; // no onsiteEnd
      return null;
    });

    const result = getCurrentApplicableRate("UTC", {
      early_bird_end_date: 1000,
      onsite_price_start_date: 2000,
      onsite_price_end_date: null
    });
    expect(result).toBe("onsite");
  });
});
