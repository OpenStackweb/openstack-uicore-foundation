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
import moment from "moment-timezone";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import { currencyAmountFromCents } from "../../../../utils/money";
import {DATETIME_FORMAT, MILLISECONDS_IN_SECOND, SPONSOR_ORDER_GRID_ITEM_TYPES} from "../../../../utils/constants";
import TransactionType from "../../SponsorOrderGrid/components/TransactionType";

const PaymentRow = ({ payment, balance, colGap = 0, trailing = 0 }) => {

  if (!payment) return null;

  return (
    <TableRow sx={{backgroundColor: "#2E7D3214"}}>
      <TableCell>{T.translate("mui_table.pay")}</TableCell>
      <TableCell>
        <TransactionType type={SPONSOR_ORDER_GRID_ITEM_TYPES.PAYMENT}>
          <Typography
            variant="body2"
            sx={{ color: "success.main", fontWeight: 500 }}
          >
            {T.translate("mui_table.payment")}
          </Typography>
        </TransactionType>
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {T.translate("mui_table.paid_via")} {payment.method}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {moment(payment.created * MILLISECONDS_IN_SECOND).format(DATETIME_FORMAT)}
        </Typography>
      </TableCell>
      {[...Array(colGap)].map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <TableCell key={`pay-col-gap-${i}`} />
      ))}
      <TableCell>
        <Typography
          variant="body2"
          sx={{ color: "success.main", fontWeight: 500 }}
        >
          {currencyAmountFromCents(payment.amount)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {balance}
        </Typography>
      </TableCell>
      {[...Array(trailing)].map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <TableCell key={`pay-trailing-col-${i}`} sx={{ width: 40 }} />
      ))}
    </TableRow>
  );
};

export default PaymentRow;
