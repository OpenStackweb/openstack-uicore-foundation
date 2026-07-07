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
import PropTypes from "prop-types";
import { Document, Page, Text, View, Image, pdf } from "@react-pdf/renderer";
import { createStyles, createRowStyles } from "./styles";
import { FieldRow, PdfTableRow, ReconciliationBlock } from "./components";
import {
  buildRows,
  formatDate,
  formatAddress,
  formatVenueName,
  getThemeFontFamily,
  fmtBalance
} from "./helpers";

export { buildRows, formatDate };

// logoSrc/theme are left to the consumer on purpose: this component is
// shared across apps with different branding/typefaces, so no logo image or
// font file ships with uicore. fontFamily is read off theme.typography and
// falls back to a react-pdf built-in (no Font.register needed) when absent;
// the theme's fontFamily must already be registered via Font.register in
// the consuming app to render as a custom typeface instead of falling back.
export const OrderPdf = ({ order, summit, logoSrc, theme }) => {
  if (!order) throw new Error("OrderPdf: order is required");
  if (!summit) throw new Error("OrderPdf: summit is required");

  const fontFamily = getThemeFontFamily(theme);
  const styles = createStyles(fontFamily);
  const rowStyles = createRowStyles(styles);
  const rows = buildRows(order, summit);

  const {
    amount_due: total = 0,
    cancelled_total: cancelledTotal = 0,
    refunds_total: refundsTotal = 0,
    retained = 0,
    credited_to_payment_method: credited = 0
  } = order;

  const clientName =
    order.client?.contact_name || order.purchased_by_full_name || "";
  const clientCompany = order.client?.company_name || "";
  const clientAddress = formatAddress(order.address) || "N/A";

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Row 1: Logo | Invoice title + Order / Date */}
        <View style={styles.headerRow} wrap={false}>
          <View style={styles.cellLeft}>
            {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : null}
          </View>
          <View style={styles.cellRight}>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <FieldRow styles={styles} label="Order" value={order.number} />
            <FieldRow
              styles={styles}
              label="Date"
              value={formatDate(
                order.purchased_date,
                summit.time_zone_id,
                "YYYY/MM/DD hh:mm a"
              )}
              noBorder
            />
          </View>
        </View>

        {/* Row 2: Client + Address | Event + Venue + Address */}
        <View style={styles.headerRow} wrap={false}>
          <View style={styles.cellLeft}>
            <FieldRow
              styles={styles}
              label="Client"
              value={`${clientCompany}\n${clientName}`}
            />
            <FieldRow
              styles={styles}
              label="Address"
              value={clientAddress}
              noBorder
            />
          </View>
          <View style={styles.cellRight}>
            <FieldRow styles={styles} label="Event" value={summit.name ?? ""} />
            <FieldRow
              styles={styles}
              label="Venue"
              value={formatVenueName(summit?.main_locations?.[0]) ?? ""}
            />
            <FieldRow
              styles={styles}
              label="Address"
              value={formatAddress(summit?.main_locations?.[0]) ?? ""}
              noBorder
            />
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableWrapper}>
          <View style={styles.table}>
            <View style={styles.thRow} fixed>
              <Text style={[styles.thText, styles.colCode]}>Code</Text>
              <Text style={[styles.thText, styles.colType]}>Type</Text>
              <Text style={[styles.thText, styles.colDesc]}>Details</Text>
              <Text style={[styles.thText, styles.colPrice]}>Amount</Text>
              <Text style={[styles.thText, styles.colBalance]}>Balance</Text>
            </View>

            {rows.map((row) => (
              <PdfTableRow
                key={row.rowKey}
                row={row}
                styles={styles}
                rowStyles={rowStyles}
              />
            ))}

            <ReconciliationBlock
              styles={styles}
              cancelledTotal={cancelledTotal}
              refundsTotal={refundsTotal}
              retained={retained}
              credited={credited}
            />

            <View style={styles.tdAmountDue}>
              <Text style={styles.tdAmountDueLabel}>AMOUNT DUE</Text>
              <View style={{ width: "18%" }} />
              <Text
                style={[
                  styles.tdAmountDueValue,
                  {
                    color: (total ?? 0) > 0 ? "#e65100" : "#1b5e20"
                  }
                ]}
              >
                {fmtBalance(total ?? 0)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

OrderPdf.propTypes = {
  order: PropTypes.object.isRequired,
  summit: PropTypes.object.isRequired,
  logoSrc: PropTypes.string,
  theme: PropTypes.object
};

export const generateInvoicePDF = async (
  order,
  summit,
  { logoSrc, theme } = {}
) => {
  try {
    const blob = await pdf(
      <OrderPdf
        order={order}
        summit={summit}
        logoSrc={logoSrc}
        theme={theme}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${order.number}.pdf`
      .toLowerCase()
      .replace(/\s+/g, "-");
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    throw error;
  }
};

export const previewPDF = async (order, summit, { logoSrc, theme } = {}) => {
  const blob = await pdf(
    <OrderPdf order={order} summit={summit} logoSrc={logoSrc} theme={theme} />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
   // Revoke after the new tab has had a chance to load the PDF.
   setTimeout(() => URL.revokeObjectURL(url), 60_000);
};
