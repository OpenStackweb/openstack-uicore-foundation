import * as React from "react";
import PropTypes from "prop-types";
import Tooltip from "@mui/material/Tooltip";

const TruncateText = ({ children, charLimit }) => {
  const ref = React.useRef(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  const shouldCharTruncate = typeof charLimit === "number";
  const isTruncated = shouldCharTruncate && children.length > charLimit;

  const displayContent = isTruncated ? children.slice(0, charLimit) + "..." : children;
  const tooltipTitle = isTruncated ? children : isOverflowing ? children : "";

  return (
    <Tooltip title={tooltipTitle} placement="top" componentsProps={{ tooltip: { sx: { fontSize: "1.2rem" } } }}>
      <span
        ref={ref}
        onMouseEnter={() => {
          if (ref.current && !shouldCharTruncate)
            setIsOverflowing(ref.current.scrollWidth > ref.current.offsetWidth);
        }}
        style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        <span style={{ fontWeight: "normal" }}>{displayContent}</span>
      </span>
    </Tooltip>
  );
};

TruncateText.propTypes = {
  children: PropTypes.string,
  charLimit: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
};

export default TruncateText;
