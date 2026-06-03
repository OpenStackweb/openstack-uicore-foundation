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
import Typography from "@mui/material/Typography";
import T from "i18n-react/dist/i18n-react";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import {currencyAmountFromCents} from "../../../../utils/money";

const ReconciliationBox = ({cancelledTotal, refundsTotal, retained, credited}) => {
  const totalColor = retained > 0 ? "error.dark" : "success.dark";
  const totalLabel = retained > 0 ? "retained" : (credited > 0 ? "credited" : "balance");

  return (
    <Box sx={{maxWidth: 400, mt: 2, mb: 3}}>
      <Typography variant="body2" sx={{mb: 3}}>
        {T.translate("sponsor_order_grid.reconciliation")}
      </Typography>
      <Box sx={{display: "flex", justifyContent: "space-between"}}>
        <Typography variant="body1" sx={{color: "text.secondary"}}>
          {T.translate("sponsor_order_grid.cancelled")}
        </Typography>
        <Typography variant="body1">
          {currencyAmountFromCents(cancelledTotal)}
        </Typography>
      </Box>
      <Box sx={{display: "flex", justifyContent: "space-between"}}>
        <Typography variant="body1" sx={{color: "text.secondary"}}>
          {T.translate("sponsor_order_grid.refunded")}
        </Typography>
        <Typography variant="body1">
          {currencyAmountFromCents(refundsTotal)}
        </Typography>
      </Box>
      <Divider sx={{my: 1}}/>
      <Box sx={{display: "flex", justifyContent: "space-between"}}>
        <Typography variant="body2">
          {T.translate(`sponsor_order_grid.${totalLabel}`)}
        </Typography>
        <Typography variant="body2" sx={{color: totalColor}}>
          {currencyAmountFromCents(retained)}
        </Typography>
      </Box>

    </Box>

  );
}

export default ReconciliationBox;