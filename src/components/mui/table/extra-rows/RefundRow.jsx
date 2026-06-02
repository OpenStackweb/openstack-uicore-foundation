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
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import { currencyAmountFromCents } from "../../../../utils/money";
import {DATETIME_FORMAT, MILLISECONDS_IN_SECOND, SPONSOR_ORDER_GRID_ITEM_TYPES} from "../../../../utils/constants";
import TransactionType from "../../SponsorOrderGrid/components/TransactionType";
import BalanceValue from "../../SponsorOrderGrid/components/BalanceValue";
import moment from "moment-timezone";

const RefundRow = ({ refund, balance, colGap = 0, trailing = 0 }) => {

  if (!refund) return null;

  return (
    <TableRow sx={{ backgroundColor: "#EF6C0014" }}>
      <TableCell>{T.translate("mui_table.ref")}</TableCell>
      <TableCell>
        <TransactionType type={SPONSOR_ORDER_GRID_ITEM_TYPES.REFUND}>
          <Typography
            variant="body1"
            sx={{ color: "warning.dark" }}
          >
            {T.translate("mui_table.refund")}
          </Typography>
        </TransactionType>
      </TableCell>
      <TableCell>
        <Typography variant="body1">
          {refund.reason}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.disabled" }}>
          {refund.status}
        </Typography>
      </TableCell>
      {[...Array(colGap)].map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <TableCell key={`ref-col-gap-${i}`} />
      ))}
      <TableCell align="right">
        <Typography
          variant="body1"
          sx={{ color: "warning.dark" }}
        >
          {currencyAmountFromCents(refund.amount)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <BalanceValue value={balance} />
      </TableCell>
      {[...Array(trailing)].map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <TableCell key={`ref-trailing-col-${i}`} sx={{ width: 40 }} />
      ))}
    </TableRow>
  );
};

export default RefundRow;
