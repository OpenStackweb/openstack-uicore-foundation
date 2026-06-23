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

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export const MuiBaseCustomTheme = {
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "--TextField-brandBorderColor": "#000",
          "--TextField-brandBorderHoverColor": "#000",
          "--TextField-brandBorderFocusedColor": "#000",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--TextField-brandBorderColor)"
          },
          "&:hover:not(.Mui-disabled, .Mui-error) .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--TextField-brandBorderHoverColor)"
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--TextField-brandBorderFocusedColor)"
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
