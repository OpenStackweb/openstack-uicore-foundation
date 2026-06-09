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
import UndoIcon from "@mui/icons-material/Undo";
import DeleteIcon from "@mui/icons-material/Delete";
import {DiscountRow, FeeRow, NotesRow, PaymentRow, RefundRow, TotalRow} from "../table/extra-rows";
import {SPONSOR_ORDER_GRID_ITEM_TYPES} from "../../../utils/constants";
import InfoNote from "../InfoNote";
import {currencyAmountFromCents} from "../../../utils/money";
import TransactionType from "./components/TransactionType";
import {formatEpoch} from "../../../utils/methods";
import TotalFooter from "./components/TotalFooter";
import ReconciliationBox from "./components/ReconciliationBox";
import CancelledItems from "./components/CancelledItems";
import BalanceValue from "./components/BalanceValue";

const mapOrderData = (forms) => {
  if (!forms) return [];

  return forms.map((form) => ({
    ...form,
    items: form.items
      .filter((it) => it.quantity)
      .map((it, i) => {
        const amount = currencyAmountFromCents(it.amount || 0);
        const itemId = it.type?.id || `${form.id}-${i}`;
        const cancelled = !!it.canceled_by_id;
        const type = cancelled ? SPONSOR_ORDER_GRID_ITEM_TYPES.CANCELLED : SPONSOR_ORDER_GRID_ITEM_TYPES.CHARGE;

        return {
          id: itemId,
          formCode: form.code,
          itemName: it.type?.name,
          itemCode: it.type?.code,
          quantity: it.quantity,
          type,
          amount,
          amountValue: it.amount,
          cancelled,
          cancelledBy: T.translate("sponsor_order_grid.cancelled_by", {
            user: it.canceled_by_full_name,
            date: formatEpoch(it.canceled_at)
          }),
        };
      })
  }));
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
    fees = [],
    payments = [],
    refunds = [],
    notes = [],
    total = 0,
    retained = 0,
    credited_to_payment_method: credited = 0,
    cancelled_total: cancelledTotal = 0,
    refunds_total: refundsTotal = 0
  } = order || {};
  const data = mapOrderData(forms);
  const cancelledItems = data.flatMap((form) => form.items.filter((it) => it.cancelled));
  const canCancel = onCancelForm && onUndoCancelForm;
  const trailingCols = canCancel ? 1 : 0;
  let balance = 0;

  const calculateBalance = (rowAmount, op = 1) => {
    balance = balance + (rowAmount * op);
    return balance;
  }

  const columns = [
    {
      columnKey: "formCode",
      header: T.translate("sponsor_order_grid.code")
    },
    {
      columnKey: "type",
      header: T.translate("sponsor_order_grid.type"),
      render: (row) => (<TransactionType type={row.type}/>)
    },
    {
      columnKey: "details",
      header: T.translate("sponsor_order_grid.details"),
      render: (row) => (
        <>
          <Typography variant="body1" sx={{...(row.cancelled && {textDecoration: "line-through"})}}>
            {row.itemName} - {T.translate("sponsor_order_grid.total")}: {row.quantity}
          </Typography>
          {row.cancelled &&
            <Typography variant="body1" sx={{color: "text.disabled"}}>
              {row.cancelledBy}
            </Typography>
          }
        </>
      )
    },
    {
      columnKey: "amount",
      header: T.translate("sponsor_order_grid.amount"),
      align: "right",
      strikethrough: true,
    }
  ];

  const colCount = columns.length + 1 + trailingCols; // 1 for balance, 1 for action col

  const paymentsAndRefundsOrdered = [
    ...payments?.map((payment) => ({...payment, type: "payment"})) || [],
    ...refunds?.map((refund) => ({...refund, type: "refund"})) || []
  ].sort((a, b) => a.created - b.created);

  return (
    <Box sx={{mt: 1}}>
      <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", mb: 2}}>
        {title && (
          <Typography gutterBottom variant="h6" sx={{mb: 4, mr: 2}}>
            {title}
          </Typography>
        )}
        {withCancelledItemsHeader && (
          <CancelledItems cancelledItems={cancelledItems} sx={{pt: "10px"}}/>
        )}
      </Box>

      {canCancel && (
        <InfoNote
          sx={{mb: 2}}
          message={T.translate(
            "sponsor_order_grid.cancel_info_note"
          )}
        />
      )}
      <TableContainer
        component={Box}
        sx={{borderRadius: "10px", mb: 4, border: "1px solid #E0E0E0"}}
      >
        <Table>
          {/* TABLE HEADER */}
          <TableHead sx={{backgroundColor: "#EAEAEA"}}>
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
          <TableBody sx={{"& td": {fontWeight: "normal"}}}>
            {data.map((form) => {
              const rows = form.items.map((row) => (
                <TableRow
                  id={`item-${row.id}`}
                  key={`item-row-${row.id}`}
                  sx={{
                    ...(row.cancelled && {bgcolor: "#FAFAFA"})
                  }}
                >
                  {(() => {
                    const cols = columns.map((col) => (
                      <TableCell
                        key={`grid-col-${row.id}-${col.columnKey}`}
                        align={col.align ?? "left"}
                        sx={{
                          ...(row.cancelled && {
                            color: "text.disabled",
                            ...(col.strikethrough && {textDecoration: "line-through"})
                          })
                        }}
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
                          ...(row.cancelled && {color: "text.disabled"})
                        }}
                      >
                        <BalanceValue value={calculateBalance(row.amountValue)}/>
                      </TableCell>
                    )

                    // ACTION COLUMN
                    if (canCancel) {
                      cols.push(
                        <TableCell
                          key="action"
                          align="right"
                        >
                          {row.cancelled ? (
                            <IconButton size="large" onClick={() => onUndoCancelForm(row)}>
                              <UndoIcon fontSize="large" sx={{color: "primary.dark"}}/>
                            </IconButton>
                          ) : (
                            <IconButton size="large" onClick={() => onCancelForm(row)}>
                              <DeleteIcon fontSize="large"/>
                            </IconButton>
                          )}
                        </TableCell>
                      )
                    }

                    return cols;
                  })()}

                </TableRow>
              ));

              const discountCents = form.discount_in_cents ?? 0;
              rows.push(
                <DiscountRow
                  key={`discount-row-${form.id}`}
                  discount={form.discount}
                  discountCents={discountCents}
                  trailing={trailingCols}
                  balance={calculateBalance(discountCents, -1)}
                />
              );

              return rows;
            })}

            {fees && fees.map((fee) => (
              <FeeRow
                key={`fee-row-${fee.id}`}
                balance={calculateBalance(fee.amount)}
                fee={fee}
                trailing={trailingCols}
              />
            ))}

            {paymentsAndRefundsOrdered.map((item) => {
              if (item.type === "payment") {
                return (
                  <PaymentRow
                    key={`payment-row-${item.id}`}
                    payment={item}
                    balance={calculateBalance(item.amount, -1)}
                    trailing={trailingCols}
                  />
                )
              } else if (item.type === "refund") {
                return (
                  <RefundRow
                    key={`refund-row-${item.id}`}
                    refund={item}
                    balance={calculateBalance(item.amount)}
                    trailing={trailingCols}
                  />
                )
              }
            })}

            {notes && notes.map((note) => (
              <NotesRow
                key={`note-row-${note.id}`}
                note={note.content}
                colCount={colCount}
                showCode
              />
            ))}

            {/* When using reconciliation, we show the total at the end */}
            {!withReconciliation &&
              <TotalRow
                total={total}
                label={T.translate("sponsor_order_grid.amount_due")}
                trailing={trailingCols}
                rowSx={{bgcolor: "#F1F3F5", "& td": {borderBottom: "none"}}}
              />
            }
            {data.length === 0 && (
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
        <Box sx={{mt: 3}}>
          <Divider/>
          <ReconciliationBox
            cancelledTotal={cancelledTotal}
            refundsTotal={refundsTotal}
            retained={retained}
            credited={credited}
          />
          <TotalFooter total={total}/>
        </Box>
      }
    </Box>
  );
};

export default SponsorOrderGrid;
