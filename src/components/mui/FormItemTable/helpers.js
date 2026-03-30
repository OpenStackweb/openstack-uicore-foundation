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

import { epochToMomentTimeZone } from "../../../utils/methods";
import { MILLISECONDS_IN_SECOND } from "../../../utils/constants";

export const getCurrentApplicableRate = (timeZone, rateDates) => {
  const now = epochToMomentTimeZone(
    Math.floor(new Date() / MILLISECONDS_IN_SECOND),
    timeZone
  );

  const earlyBirdEnd = epochToMomentTimeZone(
    rateDates.early_bird_end_date,
    timeZone
  )?.endOf("day");
  const onsiteStart = epochToMomentTimeZone(
    rateDates.onsite_price_start_date,
    timeZone
  )?.startOf("day");
  const onsiteEnd = epochToMomentTimeZone(
    rateDates.onsite_price_end_date,
    timeZone
  )?.endOf("day");

  if (earlyBirdEnd && now.isSameOrBefore(earlyBirdEnd)) return "early_bird";
  if (onsiteStart && now.isSameOrBefore(onsiteStart)) return "standard";
  if (!onsiteEnd || now.isSameOrBefore(onsiteEnd)) return "onsite";
  return "expired";
};

export const isItemAvailable = (item, currentApplicableRate) =>
  item.rates?.[currentApplicableRate] != null;
