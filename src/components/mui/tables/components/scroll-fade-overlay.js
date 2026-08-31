import * as React from "react";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";

const FADE_WIDTH = 64;
const FADE_OPACITY = 0.85;

const ScrollFadeOverlay = ({ side, visible }) => (
  <Box
    sx={(theme) => {
      const tint = alpha(theme.palette.background.paper, FADE_OPACITY);
      return {
        position: "absolute",
        top: 0,
        bottom: 0,
        [side]: 0,
        width: FADE_WIDTH,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.2s ease",
        background: `linear-gradient(to ${side === "left" ? "right" : "left"}, ${tint}, transparent)`
      };
    }}
  />
);

ScrollFadeOverlay.propTypes = {
  side: PropTypes.oneOf(["left", "right"]).isRequired,
  visible: PropTypes.bool
};

export default ScrollFadeOverlay;
