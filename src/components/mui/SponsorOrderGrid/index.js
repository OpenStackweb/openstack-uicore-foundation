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
import Box from "@mui/material/Box";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import RuleIcon from "@mui/icons-material/Rule";
import {DiscountRow, FeeRow, NotesRow, PaymentRow, RefundRow, TotalRow} from "../tables/extra-rows";
import {SPONSOR_ORDER_GRID_ITEM_TYPES} from "../../../utils/constants";
import InfoNote from "../InfoNote";
import { currencyAmountFromCents, formatDiscount } from "../../../utils/money";
import { buildOrderLedger } from "../../../utils/order-ledger";
import TransactionType from "./components/TransactionType";
import { formatEpoch } from "../../../utils/methods";
import TotalFooter from "./components/TotalFooter";
import ReconciliationBox from "./components/ReconciliationBox";
import CancelledItems from "./components/CancelledItems";
import BalanceValue from "./components/BalanceValue";
import ChangeQuantityModal from "./components/ChangeQuantityModal";

// Maps a ledger "item" entry to the row shape rendered by the columns below
// AND handed as-is to onCancelForm/onUndoCancelForm — that object shape is a
// public contract for consumers (e.g. sponsor-services), so it must keep the
// same fields mapOrderData used to produce.
const toItemRow = (entry, itemIndexByForm) => {
  const {form, item, quantity, canceledQuantity, cancellations, cancelled} = entry;
  const idx = itemIndexByForm.get(form.id) ?? 0;
  itemIndexByForm.set(form.id, idx + 1);

  return {
    id: item.line_id ?? `${form.id}-${idx}`,
    formCode: form.code,
    itemName: item.type?.name || item.title,
    itemCode: item.type?.code,
    quantity,
    canceled_quantity: canceledQuantity,
    type: cancelled ? SPONSOR_ORDER_GRID_ITEM_TYPES.CANCELLED : SPONSOR_ORDER_GRID_ITEM_TYPES.CHARGE,
    amount: currencyAmountFromCents(item.amount || 0),
    amountValue: item.amount,
    cancelled,
    cancellations
  };
};

const SponsorOrderGrid = ({
  title = T.translate("sponsor_order_grid.title"),
  order,
  withReconciliation = false,
  withCancelledItemsHeader = false,
  onCancelForm,
  onUndoCancelForm
}) => {

  const {
    forms = [],
    total = 0,
    retained = 0,
    credited_to_payment_method: credited = 0,
    cancelled_total: cancelledTotal = 0,
    refunds_total: refundsTotal = 0
  } = order || {};
  const ledger = buildOrderLedger(order);
  const hasNoRows = ledger.length === 0;
  const itemIndexByForm = new Map();
  const itemRowsByKey = new Map();
  ledger
    .filter((entry) => entry.type === "item")
    .forEach((entry) => {
      itemRowsByKey.set(entry.rowKey, toItemRow(entry, itemIndexByForm));
    });
  const cancelledItems = [...itemRowsByKey.values()].filter((row) => row.canceled_quantity > 0);
  const canCancel = onCancelForm && onUndoCancelForm;
  const trailingCols = canCancel ? 1 : 0;
  const [changeQuantityRow, setChangeQuantityRow] = React.useState(null);

  const columns = [
    {
      columnKey: "formCode",
      header: T.translate("sponsor_order_grid.code")
    },
    {
      columnKey: "type",
      header: T.translate("sponsor_order_grid.type"),
      render: (row) => (<TransactionType type={row.type} />)
    },
    {
      columnKey: "details",
      header: T.translate("sponsor_order_grid.details"),
      render: (row) => (
        <>
          <Typography variant="body1" sx={{ ...(row.cancelled && { textDecoration: "line-through" }) }}>
            {row.itemName} - {T.translate("sponsor_order_grid.total")}: {row.quantity - row.canceled_quantity}
          </Typography>
          {row.cancellations.map((cancellation) => (
            <Box key={`cancellation-${row.id}-${cancellation.id}`} sx={{ mt: 1 }}>
              <Typography variant="body1" sx={{ color: "text.disabled" }}>
                {T.translate("sponsor_order_grid.cancelled_by", {
                  x: cancellation.quantity,
                  y: row.quantity,
                  money: currencyAmountFromCents(cancellation.amount),
                  user: cancellation.canceled_by_full_name,
                  date: formatEpoch(cancellation.created, "M/D/YY [@] h:mm A")
                })}
              </Typography>
              {cancellation.reason &&
                <Typography variant="body1" sx={{ color: "text.disabled", pl: 2, fontStyle: "italic" }}>
                  ↳ {cancellation.reason}
                </Typography>
              }
            </Box>
          ))}
        </>
      )
    },
    {
      columnKey: "amount",
      header: T.translate("sponsor_order_grid.amount"),
      align: "right",
    }
  ];

  const colCount = columns.length + 1 + trailingCols; // 1 for balance, 1 for action col

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", mb: 2 }}>
        {title && (
          <Typography gutterBottom variant="h6" sx={{ mb: 4, mr: 2 }}>
            {title}
          </Typography>
        )}
        {withCancelledItemsHeader && (
          <CancelledItems cancelledItems={cancelledItems} sx={{ pt: "10px" }} />
        )}
      </Box>

      {canCancel && (
        <InfoNote
          sx={{ mb: 2 }}
          message={T.translate(
            "sponsor_order_grid.cancel_info_note"
          )}
        />
      )}
      <TableContainer
        component={Box}
        sx={{ borderRadius: "10px", mb: 4, border: "1px solid #E0E0E0" }}
      >
        <Table>
          {/* TABLE HEADER */}
          <TableHead sx={{ backgroundColor: "#EAEAEA" }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.columnKey} align={col.align ?? "left"}>
                  {col.header}
                </TableCell>
              ))}
              <TableCell key="balance" align="right">
                {T.translate("sponsor_order_grid.balance")}
              </TableCell>
              {canCancel && (
                <TableCell key="actions" align="center">
                  {T.translate("sponsor_order_grid.action")}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody sx={{ "& td": { fontWeight: "normal" } }}>
            {ledger.map((entry) => {
              switch (entry.type) {
                case "item": {
                  const row = itemRowsByKey.get(entry.rowKey);
                  return (
                    <TableRow
                      id={`item-${row.id}`}
                      key={entry.rowKey}
                      sx={{ ...(row.cancelled && { bgcolor: "#FAFAFA" }) }}
                    >
                      {(() => {
                        const cols = columns.map((col) => (
                          <TableCell
                            key={`grid-col-${row.id}-${col.columnKey}`}
                            align={col.align ?? "left"}
                            sx={{ ...(row.cancelled && { color: "text.disabled" }) }}
                          >
                            {col.render ? (
                              col.render(row)
                            ) : (
                              row[col.columnKey]
                            )}
                          </TableCell>
                        ));

                        // BALANCE COLUMN
                        cols.push(
                          <TableCell
                            key={`grid-col-${row.id}-balance`}
                            align="right"
                            sx={{
                              ...(row.cancelled && { color: "text.disabled" })
                            }}
                          >
                            <BalanceValue value={entry.balanceCents} />
                          </TableCell>
                        )

                        // ACTION COLUMN
                        if (canCancel) {
                          cols.push(
                            <TableCell
                              key="action"
                              align="right"
                            >
                              <Tooltip title={T.translate("sponsor_order_grid.change_quantity_tooltip")}>
                                <IconButton size="large" onClick={() => setChangeQuantityRow(row)}>
                                  <RuleIcon fontSize="large" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          )
                        }

                        return cols;
                      })()}

                    </TableRow>
                  );
                }

                case "discount":
                  return (
                    <DiscountRow
                      key={entry.rowKey}
                      discount={entry.form.discount ?? formatDiscount(entry.form.discount_amount, entry.form.discount_type)}
                      discountCents={entry.amountCents}
                      trailing={trailingCols}
                      balance={entry.balanceCents}
                    />
                  );

                case "fee":
                  return (
                    <FeeRow
                      key={entry.rowKey}
                      balance={entry.balanceCents}
                      fee={entry.fee}
                      trailing={trailingCols}
                    />
                  );

                case "payment":
                  return (
                    <PaymentRow
                      key={entry.rowKey}
                      payment={entry.payment}
                      balance={entry.balanceCents}
                      trailing={trailingCols}
                    />
                  );

                case "refund":
                  return (
                    <RefundRow
                      key={entry.rowKey}
                      refund={entry.refund}
                      balance={entry.balanceCents}
                      trailing={trailingCols}
                    />
                  );

                case "note":
                  return (
                    <NotesRow
                      key={entry.rowKey}
                      note={entry.note.content}
                      colCount={colCount}
                      showCode
                    />
                  );

                default:
                  return null;
              }
            })}

            {/* When using reconciliation, we show the total at the end */}
            {!withReconciliation &&
              <TotalRow
                total={total}
                label={T.translate("sponsor_order_grid.amount_due")}
                trailing={trailingCols}
                rowSx={{ bgcolor: "#F1F3F5", "& td": { borderBottom: "none" } }}
              />
            }
            {hasNoRows && (
              <TableRow>
                <TableCell colSpan={colCount} align="center">
                  {T.translate("mui_table.no_items")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {withReconciliation &&
        <Box sx={{ mt: 3 }}>
          <Divider />
          <ReconciliationBox
            cancelledTotal={cancelledTotal}
            refundsTotal={refundsTotal}
            retained={retained}
            credited={credited}
          />
          <TotalFooter total={total} />
        </Box>
      }
      {changeQuantityRow && (
        <ChangeQuantityModal
          open={!!changeQuantityRow}
          onClose={() => setChangeQuantityRow(null)}
          item={changeQuantityRow}
          onCancelForm={onCancelForm}
          onUndoCancelForm={onUndoCancelForm}
        />
      )}
    </Box>
  );
};

export default SponsorOrderGrid;
