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
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import T from "i18n-react/dist/i18n-react";
import {currencyAmountFromCents} from "../../../../utils/money";

const TotalFooter = ({total}) => {
  const safetotal = total ?? 0;
  const isNegative = safetotal < 0;
  const sign = isNegative ? "-" : "";
  const color = isNegative ? "primary.dark" : (safetotal === 0 ? "text.primary" : "error.main");
  const totalStr = `${sign}${currencyAmountFromCents(Math.abs(safetotal))}`;

  return (
    <Box sx={{
      bgcolor: "#F1F3F5",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: "1px solid #EEE",
      pt: 2,
      mt: 2,
      mx: -2,
      px: "10%",
      mb: -3,
      pb: 2,
    }}>
      <Typography sx={{fontWeight: 800, textTransform: "uppercase"}}>
        {T.translate("sponsor_order_grid.amount_due")}
      </Typography>
      <Typography sx={{color, fontWeight: 800, fontSize: "15px"}}>
        {totalStr}
      </Typography>
    </Box>
  );
}

export default TotalFooter;