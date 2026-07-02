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
import {
  MILLISECONDS_IN_SECOND,
  SPONSOR_FORMS_METAFIELD_CLASS
} from "../../../utils/constants";

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

// The global quantity for a row is driven (and therefore read-only/computed)
// when either a Form-class or an Item-class metafield of type Quantity
// exists for it. Form-class fields are shared across all rows (extraColumns);
// Item-class fields are specific to this row.
export const hasDrivingQuantityField = (row, extraColumns) => {
  const hasFormLevel = extraColumns.some((exc) => exc.type === "Quantity");
  const hasItemLevel = (row.meta_fields ?? []).some(
    (mf) =>
      mf.class_field === SPONSOR_FORMS_METAFIELD_CLASS.ITEM &&
      mf.type === "Quantity"
  );
  return hasFormLevel || hasItemLevel;
};
