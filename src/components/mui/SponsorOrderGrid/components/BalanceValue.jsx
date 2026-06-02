import React from "react";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RefreshIcon from '@mui/icons-material/Refresh';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';

import {SPONSOR_ORDER_GRID_ITEM_TYPES} from "../../../../utils/constants";
import {Box} from "@mui/material";
import Typography from "@mui/material/Typography";
import {currencyAmountFromCents} from "../../../../utils/money";

const BalanceValue = ({value}) => {
  const isNegative = value < 0;
  const sign = isNegative ? "-" : "";
  const color = isNegative ? "primary.dark" : "text.disabled";
  const balance = `${sign}${currencyAmountFromCents(Math.abs(value))}`;

  return (
    <Typography variant="body1" sx={{ color }}>
      {balance}
    </Typography>
  );
}

export default BalanceValue;