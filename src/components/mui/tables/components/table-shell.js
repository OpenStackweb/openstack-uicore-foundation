import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import PropTypes from "prop-types";
import CustomTablePagination from "./CustomTablePagination";
import useScrollFade from "./use-scroll-fade";
import ScrollFadeOverlay from "./scroll-fade-overlay";

const TableShell = ({
  children,
  totalRows,
  perPage,
  currentPage,
  onPageChange,
  onPerPageChange
}) => {
  const { containerRef, showLeftFade, showRightFade } = useScrollFade();

  return (
    <Box sx={{ width: "100%" }}>
      <Paper elevation={0} sx={{ width: "100%", mb: 2 }}>
        <Box sx={{ position: "relative" }}>
          <TableContainer
            ref={containerRef}
            component={Paper}
            sx={{ borderRadius: 0, boxShadow: "none" }}
          >
            {children}
          </TableContainer>
          <ScrollFadeOverlay side="left" visible={showLeftFade} />
          <ScrollFadeOverlay side="right" visible={showRightFade} />
        </Box>

        {perPage && currentPage && onPageChange && (
          <CustomTablePagination
            totalRows={totalRows}
            perPage={perPage}
            currentPage={currentPage}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
          />
        )}
      </Paper>
    </Box>
  );
};

TableShell.propTypes = {
  children: PropTypes.node,
  totalRows: PropTypes.number,
  perPage: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onPerPageChange: PropTypes.func
};

export default TableShell;
