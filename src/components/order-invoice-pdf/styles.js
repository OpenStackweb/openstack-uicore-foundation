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

import { StyleSheet } from "@react-pdf/renderer";

// Parameterized by fontFamily so a consumer's custom typeface (registered via
// Font.register in their own app) applies to every text style explicitly,
// not just the ones a consumer happens to remember to override.
export const createStyles = (fontFamily) => StyleSheet.create({
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

export const createRowStyles = (styles) => ({
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
