import T from "i18n-react/dist/i18n-react";
import showConfirmDialog from "../../showConfirmDialog";

const createDeleteHandler = ({
  onDelete,
  getName = (item) => item.name,
  deleteDialogTitle,
  deleteDialogBody,
  deleteDialogConfirmText,
  confirmButtonColor
}) => async (item) => {
  const isConfirmed = await showConfirmDialog({
    title: deleteDialogTitle || T.translate("general.are_you_sure"),
    text:
      typeof deleteDialogBody === "function"
        ? deleteDialogBody(getName(item))
        : deleteDialogBody ||
          `${T.translate("general.row_remove_warning")} ${getName(item)}`,
    type: "warning",
    showCancelButton: true,
    confirmButtonColor,
    confirmButtonText:
      deleteDialogConfirmText || T.translate("general.yes_delete")
  });

  if (isConfirmed) {
    onDelete(item.id);
  }
};

export default createDeleteHandler;
