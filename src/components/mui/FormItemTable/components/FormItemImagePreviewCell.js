import React, { useState } from "react";
import { Box, IconButton, Popover, Typography } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { useTranslation } from "react-i18next";

const PREVIEW_BOX_SIZE = 220;
const PREVIEW_MARGIN_BOTTOM = 1;
const PREVIEW_TRANSITION_DURATION = { enter: 120, exit: 90 };
const PREVIEW_POINTER_EVENTS = "none";

const FormItemImagePreviewCell = React.memo(({ imageUrl, itemName }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const previewActionLabel = itemName
    ? t("sponsor_edit_form.image_preview_action_alt", { itemName })
    : t("sponsor_edit_form.image_preview_action_alt");

  const previewImgAlt = itemName
    ? t("sponsor_edit_form.image_preview_alt", { itemName })
    : t("sponsor_edit_form.image_preview_alt");

  if (!imageUrl) return null;

  const isOpen = Boolean(anchorEl);

  const openPreview = (target) => {
    setAnchorEl(target);
    setImageLoadError(false);
  };

  const closePreview = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        size="small"
        aria-label={previewActionLabel}
        onMouseEnter={(event) => openPreview(event.currentTarget)}
        onMouseLeave={closePreview}
        onFocus={(event) => openPreview(event.currentTarget)}
        onBlur={closePreview}
        onClick={() => window.open(imageUrl, "_blank", "noopener,noreferrer")}
      >
        <ImageIcon fontSize="small" />
      </IconButton>

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={closePreview}
        disableRestoreFocus
        transitionDuration={PREVIEW_TRANSITION_DURATION}
        sx={{
          pointerEvents: PREVIEW_POINTER_EVENTS
        }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        slotProps={{
          paper: {
            sx: {
              p: 1,
              mb: PREVIEW_MARGIN_BOTTOM,
              pointerEvents: PREVIEW_POINTER_EVENTS
            }
          }
        }}
      >
        <Box
          sx={{
            width: PREVIEW_BOX_SIZE,
            height: PREVIEW_BOX_SIZE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}
        >
          {!imageLoadError ? (
            <Box
              component="img"
              src={imageUrl}
              alt={previewImgAlt}
              loading="lazy"
              onError={() => setImageLoadError(true)}
              sx={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "contain"
              }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              {t("sponsor_edit_form.image_preview_unavailable")}
            </Typography>
          )}
        </Box>
      </Popover>
    </>
  );
});

FormItemImagePreviewCell.displayName = "FormItemImagePreviewCell";

export default FormItemImagePreviewCell;
