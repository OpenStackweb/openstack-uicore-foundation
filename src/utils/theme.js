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

import { createTheme } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const uiCoreThemeOverrides = {
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "#000"
        },
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000"
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000"
          }
        }
      }
    },
    MuiSelect: {
      defaultProps: {
        IconComponent: KeyboardArrowDownIcon
      },
      styleOverrides: {
        icon: {
          fontSize: "24px",
          width: "24px",
          height: "24px"
        }
      }
    }
  }
};

export const CustomThemeBase = createTheme(uiCoreThemeOverrides);
