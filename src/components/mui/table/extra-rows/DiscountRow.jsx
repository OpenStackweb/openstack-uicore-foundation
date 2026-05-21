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


const DiscountRow = ({ discount, discountTotal, colGap = 2, trailing = 0 }) => {

  if (discountTotal === 0) return null;

  return (
    <TableRow sx={{backgroundColor: "#2E7D3214"}}>
      <TableCell>{T.translate("mui_table.dis")}</TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{ color: "success.main", fontWeight: 500 }}
        >
          {T.translate("mui_table.discount")}
        </Typography>
      </TableCell>
      {[...Array(colGap)].map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        (<TableCell key={`pay-col-gap-${i}`} />)
      ))}
      <TableCell>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {discount}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{ color: "success.main", fontWeight: 500 }}
        >
          -{currencyAmountFromCents(discountTotal)}
        </Typography>
      </TableCell>
      {[...Array(trailing)].map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        (<TableCell key={`pay-trailing-col-${i}`} sx={{ width: 40 }} />)
      ))}
    </TableRow>
  );
};

export default DiscountRow;
