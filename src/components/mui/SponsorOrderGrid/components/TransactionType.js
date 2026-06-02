import React from "react";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RefreshIcon from '@mui/icons-material/Refresh';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';

import {SPONSOR_ORDER_GRID_ITEM_TYPES} from "../../../../utils/constants";
import {Box} from "@mui/material";

const iconMap = {
  [SPONSOR_ORDER_GRID_ITEM_TYPES.CHARGE]: {icon: ArrowUpwardIcon, color: "warning.light"},
  [SPONSOR_ORDER_GRID_ITEM_TYPES.PAYMENT]: {icon: ArrowDownwardIcon, color: "success.light"},
  [SPONSOR_ORDER_GRID_ITEM_TYPES.DISCOUNT]: {icon: ArrowDownwardIcon, color: "success.light"},
  [SPONSOR_ORDER_GRID_ITEM_TYPES.REFUND]: {icon: RefreshIcon, color: "warning.light"},
  [SPONSOR_ORDER_GRID_ITEM_TYPES.CANCELLED]: {icon: DoNotDisturbIcon, color: "default"},
}

const TransactionType = ({type, children}) => {
  const Icon = iconMap[type].icon;
  return (
    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
      <Icon sx={{color: iconMap[type].color}} />
      {children || type}
    </Box>
  );
}

export default TransactionType;