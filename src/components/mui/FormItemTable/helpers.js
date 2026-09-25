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

import { MILLISECONDS_IN_SECOND } from "../../../utils/constants";

// Mirrors purchases-api SummitMetadata.get_current_tier / is_ordering_closed,
// which decides the rate the cart is actually priced at. The dates are exact
// instants (already stored as full days in the show timezone), so they are
// compared as-is: rounding them to whole days here made the UI report a tier
// the backend considered closed. No tier applies in two cases: "closed"
// between standard_price_end_date and onsite_price_start_date, "expired"
// after onsite_price_end_date. Same contract as sponsor-services'
// FormItemTable helper. The time zone argument is kept for API compatibility.
export const getCurrentApplicableRate = (_timeZone, rateDates) => {
  if (!rateDates) return "expired";

  const now = Date.now() / MILLISECONDS_IN_SECOND;
  const {
    early_bird_end_date: earlyBirdEnd,
    standard_price_end_date: standardEnd,
    onsite_price_start_date: onsiteStart,
    onsite_price_end_date: onsiteEnd
  } = rateDates;

  // temporary gap between the standard and the onsite periods
  if (standardEnd && onsiteStart && standardEnd < now && now < onsiteStart)
    return "closed";
  if (onsiteEnd && now > onsiteEnd) return "expired";
  if (earlyBirdEnd && now <= earlyBirdEnd) return "early_bird";

  const standardCutoff = standardEnd || onsiteStart;
  if (standardCutoff && now <= standardCutoff) return "standard";

  return "onsite";
};

export const isItemAvailable = (item, currentApplicableRate, customRate = 0) =>
  !!customRate || item.rates?.[currentApplicableRate] != null;

export const itemHasStock = (item) =>
  !item.is_sold_out && item.remaining_quantity_sponsor !== 0;

// The global quantity for a row is driven (and therefore read-only/computed)
// when a Form-class metafield of type Quantity exists for it (extraColumns,
// shared across all rows). Item-class metafields are per-row data entry
// fields unrelated to the row's global quantity, even if one happens to be
// of type Quantity, so they must not affect this.
export const hasDrivingQuantityField = (extraColumns) =>
  extraColumns.some((exc) => exc.type === "Quantity");
