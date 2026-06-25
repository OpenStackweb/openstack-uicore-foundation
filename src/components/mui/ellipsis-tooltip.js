import * as React from "react";
import Tooltip from "@mui/material/Tooltip";

const EllipsisTooltip = ({ children }) => {
  const ref = React.useRef(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  return (
    <Tooltip title={isOverflowing ? children : ""} placement="top" componentsProps={{ tooltip: { sx: { fontSize: "1.2rem" } } }}>
      <span
        ref={ref}
        onMouseEnter={() => {
          if (ref.current)
            setIsOverflowing(ref.current.scrollWidth > ref.current.offsetWidth);
        }}
        style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {children}
      </span>
    </Tooltip>
  );
};

export default EllipsisTooltip;
