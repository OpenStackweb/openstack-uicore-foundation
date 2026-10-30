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
import PropTypes from "prop-types";
import Link from "@mui/material/Link";

// real link so new tab / copy link work; plain clicks can be routed in-app via onNavigate
const TableCellLink = ({ href, row, onNavigate, children }) => {
  const handleClick = (ev) => {
    // finishing a text selection shouldn't navigate
    if (window.getSelection()?.toString()) {
      ev.preventDefault();
      return;
    }
    // new-tab / new-window clicks keep the browser's default
    if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    if (onNavigate) {
      ev.preventDefault();
      onNavigate(href, row);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      draggable={false}
      color="inherit"
      underline="hover"
      // shrink to the content, so block content from a column's render isn't full-width clickable
      sx={{ display: "inline-block" }}
    >
      {children}
    </Link>
  );
};

TableCellLink.propTypes = {
  href: PropTypes.string.isRequired,
  row: PropTypes.object.isRequired,
  onNavigate: PropTypes.func,
  children: PropTypes.node
};

export default TableCellLink;
