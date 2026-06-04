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
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import T from "i18n-react/dist/i18n-react";
import {currencyAmountFromCents} from "../../../../utils/money";

const TotalRow = ({total, colGap = 3, trailing = 0, label = null, rowSx = {}}) => {
  const totalLabel = label || T.translate("mui_table.total");
  const safetotal = total ?? 0;
  const isNegative = safetotal < 0;
  const sign = isNegative ? "-" : "";
  const color = isNegative ? "primary.dark" : (safetotal === 0 ? "text.primary" : "error.main");
  const totalStr = `${sign}${currencyAmountFromCents(Math.abs(safetotal))}`;

  return (
    <TableRow sx={rowSx}>
      <TableCell>
        <Typography sx={{fontWeight: 800, textTransform: "uppercase"}}>{totalLabel}</Typography>
      </TableCell>
      {[...Array(colGap)].map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <TableCell key={`total-gap-col-${i}`}/>
      ))}
      <TableCell align="right">
        <Typography sx={{color, fontWeight: 800, fontSize: "15px"}}>{totalStr}</Typography>
      </TableCell>
      {[...Array(trailing)].map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <TableCell key={`total-trailing-col-${i}`}/>
      ))}
    </TableRow>
  );
};

export default TotalRow;
