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
import { View, Text, Svg, Path } from "@react-pdf/renderer";
import { currencyAmountFromCents } from "../../utils/money";
import { MUI_ICON_PATHS, PDF_ICON_SIZE, fmtBalance } from "./helpers";

export const PdfIcon = ({ name, color, size = PDF_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ marginRight: 3 }}
  >
    <Path d={MUI_ICON_PATHS[name]} fill={color} />
  </Svg>
);

export const FieldRow = ({ styles, label, value, noBorder = false }) => (
  <View style={[styles.fieldRow, noBorder && styles.fieldRowNoBorder]}>
    <Text style={styles.fieldLabel}>{label ?? ""}</Text>
    <Text style={styles.fieldValue}>{value ?? ""}</Text>
  </View>
);

export const PdfTableRow = ({ row, styles, rowStyles }) => {
  // Notes span all columns, matching NotesRow in the table
  if (row.type === "note") {
    return (
      <View style={styles.tdNote}>
        <Text style={[styles.colCode, styles.muted]}>NOTE</Text>
        <Text style={[{ flex: 1 }, styles.muted]}>{row.content}</Text>
      </View>
    );
  }

  const s = rowStyles[row.cancelled ? "cancelled" : row.type];
  return (
    <View style={s.row}>
      <Text style={s.code}>{row.code}</Text>
      {s.typeBadge ? (
        <View style={styles.typeCell}>
          <PdfIcon name={s.typeBadge.icon} color={s.typeBadge.iconColor} />
          <Text
            style={[styles.typeBadgeLabel, { color: s.typeBadge.labelColor }]}
          >
            {s.typeBadge.label}
          </Text>
        </View>
      ) : (
        <View style={styles.colType} />
      )}
      <View style={styles.colDescMultiLine}>
        <Text style={s.descText}>
          {row.type === "item"
            ? `${row.description} - Total: ${row.qty}`
            : row.description}
        </Text>
        {row.cancelledBy ? (
          <Text style={styles.muted}>{row.cancelledBy}</Text>
        ) : null}
        {row.subDescription ? (
          <Text style={styles.muted}>{row.subDescription}</Text>
        ) : null}
      </View>
      <Text style={s.price}>{row.price}</Text>
      {row.balanceCents != null ? (
        <Text
          style={[
            s.balance ?? styles.colBalance,
            row.balanceCents < 0 && styles.colBalanceNegative
          ]}
        >
          {fmtBalance(row.balanceCents)}
        </Text>
      ) : (
        <View style={styles.colBalance} />
      )}
    </View>
  );
};

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
