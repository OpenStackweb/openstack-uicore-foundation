import { Typography } from "@mui/material";
import React from "react";

const Value = ({ children }) => (
  <Typography
    variant="body2"
    component="div"
    sx={{ textAlign: "left", minWidth: 120, alignSelf: "self-start" }}
  >
    {children}
  </Typography>
);

export default Value;
