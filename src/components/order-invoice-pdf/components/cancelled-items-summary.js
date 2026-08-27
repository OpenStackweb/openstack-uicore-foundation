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
import { PdfIcon } from "./pdf-icon";

// Mirrors SponsorOrderGrid's CancelledItems: an at-a-glance list of every
// (partially or fully) cancelled line, so a reader doesn't have to scan the
// whole table to find them. `items` are order-invoice-pdf rows (from
// buildRows), not raw order items.
export const CancelledItemsSummary = ({ items, styles }) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.cancelledItemsWrapper} wrap={false}>
      <PdfIcon name="DoNotDisturb" color="#212529" />
      <Text style={styles.cancelledItemsLabel}>
        {T.translate("sponsor_order_grid.cancelled_items")}
      </Text>
      {items.map((item) => (
        <Text
          key={item.rowKey}
          style={[
            styles.cancelledItemLink,
            item.cancelled && styles.cancelledItemLinkBold
          ]}
        >
          {item.code} - {item.itemCode} ({item.canceledQuantity}/{item.quantity})
        </Text>
      ))}
    </View>
  );
};
