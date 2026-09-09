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
import { useCallback, useRef, useState } from "react";
import T from "i18n-react/dist/i18n-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PropTypes from "prop-types";

const SliderPagination = ({ currentPage, totalRows, perPage, onPageChange, initialExpanded }) => {
  const totalPages = Math.max(1, Math.ceil((totalRows ?? 0) / perPage));
  const [expanded, setExpanded] = useState(initialExpanded);
  const [dragValue, setDragValue] = useState(currentPage);
  const timeoutRef = useRef(null);

  const togglePill = () => {
    if (expanded) {
      setExpanded(false);
    } else {
      setDragValue(currentPage);
      setExpanded(true);
    }
  };

  const onSliderChange = useCallback((_ev, value) => setDragValue(value), []);

  const onSliderCommit = useCallback(
    (_ev, value) => {
      onPageChange(value);
      timeoutRef.current = setTimeout(() => setExpanded(false), 150);
    },
    [onPageChange]
  );

  // also sync dragValue so the label/slider don't go stale while the pill is expanded
  const prev = () => {
    const newPage = Math.max(1, currentPage - 1);
    setDragValue(newPage);
    onPageChange(newPage);
  };
  const next = () => {
    const newPage = Math.min(totalPages, currentPage + 1);
    setDragValue(newPage);
    onPageChange(newPage);
  };

  return (
    <ClickAwayListener onClickAway={() => expanded && setExpanded(false)}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          height: 40,
          borderRadius: 20,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden"
        }}
      >
        <IconButton
          size="small"
          onClick={prev}
          disabled={currentPage <= 1}
          aria-label={T.translate("mui_table.previous_page")}
        >
          {/* explicit px so a host page's root font-size reset can't shrink this */}
          <ChevronLeftIcon sx={{ fontSize: "24px" }} />
        </IconButton>
        <Typography
          component="button"
          type="button"
          onClick={togglePill}
          variant="body1"
          color="text.secondary"
          sx={{
            border: "none",
            background: "none",
            px: 1.5,
            height: 40,
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          {T.translate("mui_table.page_of", {
            page: expanded ? dragValue : currentPage,
            totalPages
          })}
        </Typography>
        <Box
          sx={{
            width: expanded ? 220 : 0,
            overflow: "hidden",
            transition: (theme) => theme.transitions.create("width"),
            display: "flex",
            alignItems: "center",
            px: expanded ? 2 : 0
          }}
        >
          <Slider
            size="small"
            min={1}
            max={totalPages}
            step={1}
            value={dragValue}
            onChange={onSliderChange}
            onChangeCommitted={onSliderCommit}
            valueLabelDisplay="auto"
            sx={{ width: 180 }}
          />
        </Box>
        <IconButton
          size="small"
          onClick={next}
          disabled={currentPage >= totalPages}
          aria-label={T.translate("mui_table.next_page")}
        >
          <ChevronRightIcon sx={{ fontSize: "24px" }} />
        </IconButton>
      </Box>
    </ClickAwayListener>
  );
};

SliderPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalRows: PropTypes.number,
  perPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  initialExpanded: PropTypes.bool
};

SliderPagination.defaultProps = {
  totalRows: 0,
  initialExpanded: false
};

export default SliderPagination;
