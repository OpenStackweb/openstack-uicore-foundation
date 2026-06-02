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
import {DiscountRow, FeeRow, NotesRow, PaymentRow, RefundRow, TotalRow} from "../table/extra-rows";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from '@mui/icons-material/Undo';
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import {currencyAmountFromCents} from "../../../utils/money";
import {SPONSOR_ORDER_GRID_ITEM_TYPES} from "../../../utils/constants";
import TransactionType from "./components/TransactionType";
import BalanceValue from "./components/BalanceValue";
import InfoNote from "../InfoNote";
import Typography from "@mui/material/Typography";

const mapOrderData = (forms) => {
  if (!forms) return [];

  return forms.map((form) => ({
    ...form,
    items: form.items
      .filter((it) => it.quantity)
      .map((it) => {
        const itemDetails = [
          <Typography key={`item-details-${it.id}`} variant="body1">
            {form.name} - {it.type?.name}
          </Typography>,
          <Typography key={`item-total-${it.id}`} variant="body1" sx={{ color: "text.disabled" }}>
            {T.translate("sponsor_order_grid.total")}: {it.quantity}
          </Typography>
        ];
        const amount = currencyAmountFromCents(it.amount || 0);
        const lineId = it.line_id;
        const cancelled = !!it.canceled_by_id;
        const type = cancelled ? SPONSOR_ORDER_GRID_ITEM_TYPES.CANCELLED : SPONSOR_ORDER_GRID_ITEM_TYPES.CHARGE;

        return {
          id: lineId,
          code: form.code,
          name: `${form.name} - ${it.type?.name}`,
          type,
          addon_name: form.addon_name,
          details: itemDetails,
          amount,
          amountValue: it.amount,
          cancelled
        };
      })
  }));
};

const SponsorOrderGrid = ({
                            lines,
                            notes,
                            payments,
                            refunds,
                            fees,
                            total,
                            onCancelForm,
                            onUndoCancelForm
                          }) => {
  const data = mapOrderData(lines);
  const canCancel = onCancelForm && onUndoCancelForm;
  const trailingCols = canCancel ? 1 : 0;
  let balance = 0;

  const calculateBalance = (rowAmount, op = 1) => {
    balance = balance + (rowAmount * op);
    return balance;
  }

  const columns = [
    {
      columnKey: "code",
      header: T.translate("sponsor_order_grid.code")
    },
    {
      columnKey: "type",
      header: T.translate("sponsor_order_grid.type"),
      render: (row) => (<TransactionType type={row.type}/>)
    },
    {
      columnKey: "details",
      header: T.translate("sponsor_order_grid.details")
    },
    {
      columnKey: "amount",
      header: T.translate("sponsor_order_grid.amount"),
      align: "right"
    }
  ];

  const colCount = columns.length + 1 + trailingCols; // 1 for balance, 1 for action col

  return (
    <Box
      sx={{
        width: "100%",
        padding: 0,
        border: "1px solid #EEE",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        mb: 3,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "& *": {fontFamily: "inherit"},
      }}
    >
      {canCancel && (
        <InfoNote
          message={T.translate(
            "sponsor_order_grid.cancel_info_note"
          )}
          sx={{m: 2}}
        />
      )}
      <Paper elevation={0} sx={{width: "100%", p: 0}}>
        <TableContainer
          component={Paper}
          sx={{borderRadius: "8px", boxShadow: "none"}}
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
                    key={`grid-row-${row.id}`}
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
                              ...(col.columnKey !== "type" && {textDecoration: "line-through"})
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
                            key="balance"
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

                rows.push(
                  <DiscountRow
                    key={`discount-row-${form.id}`}
                    discount={form.discount}
                    discountCents={form.discount_total}
                    trailing={trailingCols}
                    balance={calculateBalance(form.discount_in_cents, -1)}
                  />
                );

                return rows;
              })}
              {fees && fees.map((fee) => (
                <FeeRow
                  key={`fee-row-${fee.id}`}
                  balance={calculateBalance(fee.amount)}
                  fee={fee}
                  trailing={1}
                />
              ))}
              {refunds && refunds.map((refund) => (
                <RefundRow
                  key={`refund-row-${refund.id}`}
                  refund={refund}
                  balance={calculateBalance(refund.amount, -1)}
                  trailing={trailingCols}
                />
              ))}
              {payments && payments.map((payment) => (
                <PaymentRow
                  key={`payment-row-${payment.id}`}
                  payment={payment}
                  balance={calculateBalance(payment.amount, -1)}
                  trailing={trailingCols}
                />
              ))}
              {notes && notes.map((note) => (
                <NotesRow
                  key={`note-row-${note.id}`}
                  note={note.content}
                  colCount={colCount}
                  showCode
                />
              ))}

              <TotalRow
                total={total}
                label={T.translate("sponsor_order_grid.amount_due")}
                trailing={trailingCols}
                rowSx={{backgroundColor: "#F1F3F5", "& td": {borderBottom: "none"}}}
              />

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
      </Paper>
    </Box>
  );
};

export default SponsorOrderGrid;
