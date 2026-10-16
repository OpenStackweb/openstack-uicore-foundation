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
  // must match the apps' html font-size so MUI's rem values render at their designed px
  typography: {
    htmlFontSize: 16
  },
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
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: "1em", fontWeight: "400" }
      }
    },
    // icon scale with medium at 22px, keeping MUI's small/large proportions (18 / 22 / 32px)
    MuiSvgIcon: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.fontSize === "small" && { fontSize: "1.125rem" }),
          ...(ownerState.fontSize === "medium" && { fontSize: "1.375rem" }),
          ...(ownerState.fontSize === "large" && { fontSize: "2rem" })
        })
      }
    },
  }
};
