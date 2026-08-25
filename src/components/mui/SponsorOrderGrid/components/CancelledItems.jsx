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
import Typography from "@mui/material/Typography";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

const CancelledItems = ({ cancelledItems, sx = {} }) => {
  if (cancelledItems.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "row", ...sx }}>
      <DoNotDisturbIcon sx={{ mr: "3px", top: "2px", position: "relative" }} />
      <Typography variant="body2" sx={{ mb: 2, mr: 1 }}>
        {T.translate("sponsor_order_grid.cancelled_items")}
      </Typography>
      {cancelledItems.map((item) => {
        const fullyCanceled = item.canceled_quantity === item.quantity;
        const fontWeight = fullyCanceled ? "bold" : "normal";

        return (
          <Link
            key={`cancelled-item-${item.id}`}
            variant="body1"
            href={`#item-${item.id}`}
            sx={{ mr: 1, color: "text.disabled", fontWeight, textDecorationColor: "rgba(0, 0, 0, 0.38)" }}
          >
            {item.formCode} - {item.itemCode} ({item.canceled_quantity}/{item.quantity})
          </Link>
        )
      })}
    </Box>
  );
}

export default CancelledItems;