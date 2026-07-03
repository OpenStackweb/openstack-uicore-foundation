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
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Svg,
  Path,
  StyleSheet,
  pdf
} from "@react-pdf/renderer";
import { currencyAmountFromCents } from "../../utils/money";
import { epochToMomentTimeZone } from "../../utils/methods";

const DEFAULT_FONT_FAMILY = "Helvetica";

const formatDate = (epoch, timeZoneId, format) =>
  epochToMomentTimeZone(epoch, timeZoneId).format(format);

const formatAddress = (address) => {
  if (!address) return "";
  return [
    address.address_1,
    address.address_2,
    address.city,
    address.state,
    address.zip_code,
    address.country
  ]
    .filter(Boolean)
    .join(", ");
};

const formatVenueName = (location) => {
  if (!location) return "";
  return `${location?.short_name ?? ""}${location?.name ? ` (${location?.name})` : ""}`;
};

const MUI_ICON_PATHS = {
  ArrowUpward: "M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z",
  ArrowDownward:
    "M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z",
  Refresh:
    "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
  DoNotDisturb:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"
};

const PDF_ICON_SIZE = 8;

const PdfIcon = ({ name, color, size = PDF_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ marginRight: 3 }}
  >
    <Path d={MUI_ICON_PATHS[name]} fill={color} />
  </Svg>
);

export const buildRows = (order, summit) => {
  const rows = [];
  let balanceCents = 0;

  (order.forms || []).forEach((form) => {
    (form.items || [])
      .filter((item) => item.quantity)
      .forEach((item) => {
        // Cancelled is per-item
        const cancelled = !!item.canceled_by_id;
        const cancelledBy = cancelled
          ? `Cancelled by ${item.canceled_by_full_name} on ${formatDate(item.canceled_at, summit.time_zone_id, "YYYY/MM/DD HH:mm")}`
          : "";

        // Cancelled items still accumulate
        balanceCents += item.amount;

        rows.push({
          rowKey: `item-${item.line_id ?? item.id}`,
          type: "item",
          // Table shows form.code per item row (columnKey: "formCode", value: form.code)
          code: String(form.code || ""),
          description: String(item.type?.name || item.title || ""),
          addon: String(form.add_on?.name || ""),
          qty: String(item.quantity ?? 1),
          price: currencyAmountFromCents(item.amount),
          balanceCents,
          cancelled,
          cancelledBy
        });
      });

    const discountCents = form.discount_in_cents ?? 0;
    if (discountCents) {
      balanceCents -= discountCents;
      rows.push({
        rowKey: `discount-${form.id}`,
        type: "discount",
        code: "DIS",
        description: String(form.discount || ""),
        addon: "",
        qty: "",
        price: currencyAmountFromCents(discountCents),
        balanceCents
      });
    }
  });

  (order.fees || []).forEach((fee) => {
    balanceCents += fee.amount;
    rows.push({
      rowKey: `fee-${fee.id}`,
      type: "fee",
      code: "PAYFEE",
      description: String(fee.title || ""),
      addon: "",
      qty: "1",
      price: currencyAmountFromCents(fee.amount),
      balanceCents
    });
  });

  // Payments and refunds interleaved and sorted by created:
  const paymentsAndRefundsOrdered = [
    ...(order.payments || []).map((p) => ({ ...p, _rowType: "payment" })),
    ...(order.refunds || []).map((r) => ({ ...r, _rowType: "refund" }))
  ].sort((a, b) => a.created - b.created);

  paymentsAndRefundsOrdered.forEach((item) => {
    if (item._rowType === "payment") {
      balanceCents -= item.amount;
      rows.push({
        rowKey: `payment-${item.id}`,
        type: "payment",
        code: "PAY",
        description: `Paid via ${item.method || "card"}`,
        subDescription: formatDate(
          item.created,
          summit.time_zone_id,
          "YYYY/MM/DD HH:mm"
        ),
        addon: "",
        qty: "1",
        price: currencyAmountFromCents(item.amount),
        balanceCents
      });
    } else {
      balanceCents += item.amount;
      rows.push({
        rowKey: `refund-${item.id}`,
        type: "refund",
        code: "REF",
        description: String(item.reason || "Refund"),
        subDescription: String(item.status || ""),
        addon: "",
        qty: "1",
        price: currencyAmountFromCents(item.amount),
        balanceCents
      });
    }
  });

  (order.notes || []).forEach((note) => {
    rows.push({
      rowKey: `note-${note.id}`,
      type: "note",
      content: String(note.content || "")
    });
  });

  return rows;
};

const fmtBalance = (cents) => {
  if (cents == null) return "";
  const abs = currencyAmountFromCents(Math.abs(cents));
  return cents < 0 ? `-${abs}` : abs;
};

// Parameterized by fontFamily so a consumer's custom typeface (registered via
// Font.register in their own app) applies to every text style explicitly,
// not just the ones a consumer happens to remember to override.
const createStyles = (fontFamily) => StyleSheet.create({
  page: {
    backgroundColor: "#F7F7F8",
    padding: 64,
    fontFamily,
    fontSize: 8,
    color: "#212529"
  },
  headerRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 20
  },
  cellLeft: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DEE2E6",
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: "center"
  },
  logo: {
    width: "100%",
    height: 84,
    objectFit: "contain",
    marginBottom: 0,
    paddingBottom: 0
  },
  cellRight: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DEE2E6",
    paddingHorizontal: 18,
    paddingVertical: 10
  },
  invoiceTitle: {
    fontFamily,
    fontWeight: "bold",
    fontSize: 14,
    lineHeight: 1.5,
    letterSpacing: 0,
    color: "rgba(17, 19, 21, 1)",
    marginBottom: 8
  },
  fieldRow: {
    fontSize: 8,
    lineHeight: 1.8,
    flexDirection: "row",
    color: "rgba(0, 0, 0, 0.87)",
    paddingBottom: 3,
    paddingTop: 6,
    borderBottom: "1px solid rgba(224, 224, 224, 1)",
    alignContent: "flex-start"
  },
  fieldRowNoBorder: {
    borderBottomWidth: 0
  },
  fieldLabel: {
    flex: 4,
    fontWeight: "bold",
    color: "rgba(0, 0, 0, 0.87)"
  },
  fieldValue: {
    flex: 9
  },
  tableWrapper: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#eee",
    backgroundColor: "#ffffff"
  },
  table: {
    fontFamily,
    borderRadius: 8,
    overflow: "hidden"
  },
  thRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#eee"
  },
  thText: {
    fontFamily,
    fontSize: 7,
    fontWeight: 600,
    color: "#333333"
  },
  tdRow: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#eee"
  },
  tdPayment: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: "flex-start",
    backgroundColor: "#f0fdf4",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#eee"
  },
  tdRefund: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: "flex-start",
    backgroundColor: "#fff7ed",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#eee"
  },
  tdNote: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#eee"
  },
  tdAmountDue: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderTopWidth: 1,
    borderTopColor: "#000000"
  },
  colCode: { width: "12%", fontSize: 8 },
  colCodePayment: { width: "12%", fontSize: 8, fontWeight: "bold" },
  colType: { width: "15%", fontSize: 8 },
  colDesc: { width: "39%", fontSize: 8 },
  colDescMultiLine: {
    width: "39%",
    flexDirection: "column",
    justifyContent: "flex-start"
  },
  colPrice: { width: "18%", textAlign: "right", fontSize: 8, color: "#333333" },
  colPriceRefund: {
    fontFamily,
    width: "18%",
    textAlign: "right",
    fontSize: 8,
    fontWeight: "bold",
    color: "#e65100"
  },
  colPricePayment: {
    fontFamily,
    width: "18%",
    textAlign: "right",
    fontSize: 8,
    fontWeight: "bold",
    color: "#1b5e20"
  },
  colBalance: {
    width: "16%",
    textAlign: "right",
    fontSize: 8,
    color: "#666666"
  },
  colBalanceNegative: { color: "#dc2626" },
  tdAmountDueLabel: {
    fontFamily,
    width: "66%",
    fontSize: 8,
    fontWeight: 700
  },
  tdAmountDueValue: {
    fontFamily,
    width: "16%",
    textAlign: "right",
    fontSize: 9,
    fontWeight: 700
  },
  paymentDesc: { fontFamily, fontSize: 8, fontWeight: "bold" },
  muted: { color: "#6C757D", fontSize: 8 },
  typeCell: { width: "15%", flexDirection: "row", alignItems: "center" },
  typeBadgeLabel: { fontSize: 8 },
  cancelledText: { color: "#9ca3af", textDecoration: "line-through" },
  reconciliationWrapper: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#eee"
  },
  reconciliationBox: {
    width: "33%"
  },
  reconciliationTitle: {
    fontFamily,
    fontSize: 8,
    fontWeight: 600,
    color: "#333333",
    marginBottom: 6
  },
  reconciliationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2
  },
  reconciliationLabel: {
    fontSize: 7,
    color: "#6C757D"
  },
  reconciliationValue: {
    fontSize: 7,
    color: "#333333",
    textAlign: "right"
  },
  reconciliationDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
    marginVertical: 4
  }
});

const createRowStyles = (styles) => ({
  fee: {
    row: styles.tdRow,
    code: styles.colCode,
    descText: null,
    price: styles.colPrice,
    typeBadge: {
      icon: "ArrowUpward",
      iconColor: "#ff9800",
      label: "Charge",
      labelColor: "#333333"
    }
  },
  item: {
    row: styles.tdRow,
    code: styles.colCode,
    descText: null,
    price: styles.colPrice,
    typeBadge: {
      icon: "ArrowUpward",
      iconColor: "#ff9800",
      label: "Charge",
      labelColor: "#333333"
    }
  },
  discount: {
    row: styles.tdPayment,
    code: styles.colCodePayment,
    descText: styles.paymentDesc,
    price: styles.colPricePayment,
    typeBadge: {
      icon: "ArrowDownward",
      iconColor: "#4caf50",
      label: "Discount",
      labelColor: "#1b5e20"
    }
  },
  payment: {
    row: styles.tdPayment,
    code: styles.colCodePayment,
    descText: styles.paymentDesc,
    price: styles.colPricePayment,
    typeBadge: {
      icon: "ArrowDownward",
      iconColor: "#4caf50",
      label: "Payment",
      labelColor: "#1b5e20"
    }
  },
  refund: {
    row: styles.tdRefund,
    code: styles.colCodePayment,
    descText: styles.paymentDesc,
    price: styles.colPriceRefund,
    typeBadge: {
      icon: "Refresh",
      iconColor: "#ea580c",
      label: "Refund",
      labelColor: "#e65100"
    }
  },
  cancelled: {
    row: styles.tdRow,
    code: [styles.colCode, styles.cancelledText],
    descText: styles.cancelledText,
    price: [styles.colPrice, styles.cancelledText],
    balance: [styles.colBalance, styles.cancelledText],
    typeBadge: {
      icon: "DoNotDisturb",
      iconColor: "#9ca3af",
      label: "Cancelled",
      labelColor: "#9ca3af"
    }
  }
});

const PdfTableRow = ({ row, styles, rowStyles }) => {
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

const FieldRow = ({ styles, label, value, noBorder = false }) => (
  <View style={[styles.fieldRow, noBorder && styles.fieldRowNoBorder]}>
    <Text style={styles.fieldLabel}>{label ?? ""}</Text>
    <Text style={styles.fieldValue}>{value ?? ""}</Text>
  </View>
);

// Uses order-level totals matching the table's ReconciliationBox props:
//   cancelledTotal  ← order.cancelled_total
//   refundsTotal    ← order.refunds_total
//   retained        ← order.retained
//   credited        ← order.credited_to_payment_method
const ReconciliationBlock = ({
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

// logoSrc/fontFamily are left to the consumer on purpose: this component is
// shared across apps with different branding/typefaces, so no logo image or
// font file ships with uicore. fontFamily defaults to a react-pdf built-in
// (no Font.register needed); pass a family already registered via
// Font.register in the consuming app to use a custom typeface.
export const OrderPdf = ({
  order,
  summit,
  logoSrc,
  fontFamily = DEFAULT_FONT_FAMILY
}) => {
  const styles = createStyles(fontFamily);
  const rowStyles = createRowStyles(styles);
  const rows = buildRows(order, summit);

  const {
    amount_due: total = 0,
    cancelled_total: cancelledTotal = 0,
    refunds_total: refundsTotal = 0,
    retained = 0,
    credited_to_payment_method: credited = 0
  } = order || {};

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
  fontFamily: PropTypes.string
};

export const generateInvoicePDF = async (
  order,
  summit,
  { logoSrc, fontFamily } = {}
) => {
  try {
    const blob = await pdf(
      <OrderPdf
        order={order}
        summit={summit}
        logoSrc={logoSrc}
        fontFamily={fontFamily}
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

export const previewPDF = async (order, summit, { logoSrc, fontFamily } = {}) => {
  const blob = await pdf(
    <OrderPdf
      order={order}
      summit={summit}
      logoSrc={logoSrc}
      fontFamily={fontFamily}
    />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};
