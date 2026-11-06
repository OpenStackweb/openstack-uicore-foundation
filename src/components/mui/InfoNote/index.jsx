import React from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const InfoNote = ({ message, sx }) => (
  <Box
    sx={[
      { display: "flex", alignItems: "flex-start", gap: 1 },
      ...(Array.isArray(sx) ? sx : [sx])
    ]}
  >
    <InfoOutlinedIcon
      fontSize="small"
      sx={{ color: "text.secondary", mt: "2px" }}
    />
    <Typography variant="body1" sx={{ color: "text.secondary", fontSize: "13px" }}>
      {message}
    </Typography>
  </Box>
);

export default InfoNote;
