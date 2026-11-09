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
const TextLink = ({ href, onNavigate, disabled, children }) => {
  const handleClick = (ev) => {
    // new-tab / new-window clicks keep the browser's default
    if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    // a mouse click finishing a text selection in this link shouldn't navigate (keyboard has detail 0)
    const selection = window.getSelection();
    if (ev.detail > 0 && selection?.toString() && ev.currentTarget.contains(selection.anchorNode)) {
      ev.preventDefault();
      return;
    }
    if (onNavigate) {
      ev.preventDefault();
      onNavigate(href);
    }
  };

  // disabled shows the content without a link
  if (disabled) return <>{children}</>;

  return (
    <Link
      href={href}
      onClick={handleClick}
      draggable={false}
      color="inherit"
      underline="hover"
      // shrink to the content, so block children aren't full-width clickable
      sx={{ display: "inline-block" }}
    >
      {children}
    </Link>
  );
};

TextLink.propTypes = {
  href: PropTypes.string.isRequired,
  onNavigate: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node
};

export default TextLink;
