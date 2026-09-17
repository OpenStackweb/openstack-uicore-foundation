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

import * as React from "react";
import T from "i18n-react/dist/i18n-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import PropTypes from "prop-types";
import { DEFAULT_PER_PAGE, FIFTY_PER_PAGE, TWENTY_PER_PAGE } from "../../../../utils/constants";
import SliderPagination from "./SliderPagination";

const BASE_PER_PAGE_OPTIONS = [DEFAULT_PER_PAGE, TWENTY_PER_PAGE, FIFTY_PER_PAGE];

const CustomTablePagination = ({
  totalRows,
  perPage,
  currentPage,
  onPageChange,
  onPerPageChange,
  showRange,
  pageSliderVisible
}) => {
  const perPageOptions = React.useMemo(
    () =>
      BASE_PER_PAGE_OPTIONS.includes(perPage)
        ? BASE_PER_PAGE_OPTIONS
        : [...BASE_PER_PAGE_OPTIONS, perPage].sort((a, b) => a - b),
    [perPage]
  );

  const handleRowsPerPageChange = (ev) => {
    onPerPageChange(Number(ev.target.value));
  };

  const total = totalRows ?? 0;
  const from = total > 0 ? (currentPage - 1) * perPage + 1 : 0;
  const to = Math.min(currentPage * perPage, total);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.5,
        my: 1
      }}
    >
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        {showRange && (
          <Typography variant="body1" color="text.secondary">
            {T.translate("mui_table.showing_range", { from, to, total })}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: { xs: "space-between", md: "flex-end" },
          width: { xs: "100%", md: "auto" },
          gap: 1.5,
          minWidth: 0
        }}
      >
        {onPerPageChange && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
              {T.translate("mui_table.rows_per_page")}
            </Typography>
            <Select
              size="small"
              value={perPage}
              onChange={handleRowsPerPageChange}
              sx={{
                height: 40,
                borderRadius: "20px",
                minWidth: 80,
                bgcolor: "background.paper",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                "& .MuiSelect-select": { color: "text.secondary" }
              }}
              inputProps={{ "aria-label": T.translate("mui_table.rows_per_page") }}
            >
              {perPageOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}
        <SliderPagination
          totalRows={totalRows}
          perPage={perPage}
          currentPage={currentPage}
          onPageChange={onPageChange}
          initialExpanded={pageSliderVisible}
        />
      </Box>
    </Box>
  );
};

CustomTablePagination.propTypes = {
  totalRows: PropTypes.number,
  perPage: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPerPageChange: PropTypes.func,
  showRange: PropTypes.bool,
  pageSliderVisible: PropTypes.bool
};

CustomTablePagination.defaultProps = {
  showRange: false,
  pageSliderVisible: false
};

export default CustomTablePagination;
