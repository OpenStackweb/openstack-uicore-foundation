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
import { View, Text } from "@react-pdf/renderer";
import { currencyAmountFromCents } from "../../../utils/money";

// Uses order-level totals matching the table's ReconciliationBox props:
//   cancelledTotal  ← order.cancelled_total
//   refundsTotal    ← order.refunds_total
//   retained        ← order.retained
//   credited        ← order.credited_to_payment_method
export const ReconciliationBlock = ({
  styles,
  cancelledTotal,
  refundsTotal,
  retained,
  credited
}) => {
  const totalColor = retained > 0 ? "#c62828" : "#1b5e20";
  const totalLabel =
    retained > 0
      ? "Retained as cancellation fee"
      : credited > 0
        ? "Credited to Payment Method"
        : "Balance";
  const totalValue =
    retained > 0 ? retained : credited > 0 ? credited : retained;

  return (
    <View style={styles.reconciliationWrapper} wrap={false}>
      <View style={styles.reconciliationBox}>
        <Text style={styles.reconciliationTitle}>Reconciliation</Text>
        <View style={styles.reconciliationRow}>
          <Text style={styles.reconciliationLabel}>Cancelled</Text>
          <Text style={styles.reconciliationValue}>
            {currencyAmountFromCents(cancelledTotal ?? 0)}
          </Text>
        </View>
        <View style={styles.reconciliationRow}>
          <Text style={styles.reconciliationLabel}>Refunded</Text>
          <Text style={styles.reconciliationValue}>
            {currencyAmountFromCents(refundsTotal ?? 0)}
          </Text>
        </View>
        <View style={styles.reconciliationDivider} />
        <View style={styles.reconciliationRow}>
          <Text style={styles.reconciliationLabel}>{totalLabel}</Text>
          <Text style={[styles.reconciliationValue, { color: totalColor }]}>
            {currencyAmountFromCents(totalValue ?? 0)}
          </Text>
        </View>
      </View>
    </View>
  );
};
