import { Typography } from "@mui/material";
import React from "react";

const Heading = ({ children }) => (
  <Typography
    variant="subtitle2"
    component="div"
    sx={{ minWidth: 120, alignSelf: "self-start" }}
  >
    {children}
  </Typography>
);

export default Heading;
