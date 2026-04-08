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
import { Button, Box } from "@mui/material";
import T from "i18n-react";

const CartButton = ({ itemCount, onClick, sx, disabled }) => {
  return (
    <Button
      endIcon={
        !disabled && (
          <Box
            component="div"
            sx={{
              backgroundColor: "white",
              color: "primary.main",
              fontWeight: 700,
              fontSize: "12px !important",
              minWidth: "20px",
              height: "20px",
              borderRadius: "10px",
              marginLeft: "4px",
              marginRight: "2px"
            }}
          >
            {itemCount}
          </Box>
        )
      }
      onClick={onClick}
      color="primary"
      variant="contained"
      size="large"
      sx={{ borderRadius: 92, ...sx }}
      disabled={disabled}
    >
      {T.translate("buttons.my_cart")}
    </Button>
  );
};

export default CartButton;
