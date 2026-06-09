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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RefreshIcon from '@mui/icons-material/Refresh';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import {SPONSOR_ORDER_GRID_ITEM_TYPES} from "../../../../utils/constants";
import Box from "@mui/material/Box";

const iconMap = {
  [SPONSOR_ORDER_GRID_ITEM_TYPES.CHARGE]: {icon: ArrowUpwardIcon, color: "warning.light"},
  [SPONSOR_ORDER_GRID_ITEM_TYPES.PAYMENT]: {icon: ArrowDownwardIcon, color: "success.light"},
  [SPONSOR_ORDER_GRID_ITEM_TYPES.DISCOUNT]: {icon: ArrowDownwardIcon, color: "success.light"},
  [SPONSOR_ORDER_GRID_ITEM_TYPES.REFUND]: {icon: RefreshIcon, color: "warning.light"},
  [SPONSOR_ORDER_GRID_ITEM_TYPES.CANCELLED]: {icon: DoNotDisturbIcon, color: "default"},
}

const TransactionType = ({type, children}) => {
  const meta = iconMap[type];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
      <Icon sx={{color: meta.color}} />
      {children || type}
    </Box>
  );
}

export default TransactionType;