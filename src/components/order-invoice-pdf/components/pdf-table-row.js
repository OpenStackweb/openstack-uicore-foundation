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
import T from "i18n-react/dist/i18n-react";
import { View, Text } from "@react-pdf/renderer";
import { formatBalance } from "../../../utils/money";
import { PdfIcon } from "./pdf-icon";

export const PdfTableRow = ({ row, styles, rowStyles }) => {
  // Notes span all columns, matching NotesRow in the table
  if (row.type === "note") {
    return (
      <View style={styles.tdNote}>
        <Text style={[styles.colCode, styles.muted]}>
          {T.translate("mui_table.note")}
        </Text>
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
            ? `${row.description} - ${T.translate("mui_table.total")}: ${row.qty}`
            : row.description}
        </Text>
        {(row.cancellations || []).map((cancellation) => (
          <React.Fragment key={cancellation.id}>
            <Text style={styles.muted}>{cancellation.label}</Text>
            {cancellation.reason && (
              <Text style={styles.muted}>{cancellation.reason}</Text>
            )}
          </React.Fragment>
        ))}
        {row.subDescription && (
          <Text style={styles.muted}>{row.subDescription}</Text>
        )}
      </View>
      <Text style={s.price}>{row.price}</Text>
      {row.balanceCents != null ? (
        <Text
          style={[
            s.balance ?? styles.colBalance,
            row.balanceCents < 0 && styles.colBalanceNegative
          ]}
        >
          {formatBalance(row.balanceCents)}
        </Text>
      ) : (
        <View style={styles.colBalance} />
      )}
    </View>
  );
};