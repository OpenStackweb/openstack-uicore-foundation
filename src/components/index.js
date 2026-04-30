import React from 'react';
import T from 'i18n-react';
import { getCurrentUserLanguage } from '../utils/methods';

export {default as AjaxLoader} from './ajaxloader';
export {default as RawHTML} from './raw-html';
export {default as FreeTextSearch} from './free-text-search';
export {default as DateTimePicker} from './inputs/datetimepicker'
export {default as GroupedDropdown} from './inputs/grouped-dropdown'
export {default as UploadInput} from './inputs/upload-input'
export {default as UploadInputV2} from './inputs/upload-input-v2'
export {default as UploadInputV3} from './inputs/upload-input-v3'
export {default as CompanyInput} from './inputs/company-input'
export {default as PromocodeInput} from './inputs/promocode-input'
export {default as SponsorInput} from './inputs/sponsor-input'
export {default as OrganizationInput} from './inputs/organization-input'
export {default as CountryDropdown} from './inputs/country-dropdown'
export {default as Dropdown} from './inputs/dropdown'
export {default as TextEditor} from './inputs/editor-input'
export {default as TextArea} from './inputs/textarea-input'
export {default as EventInput} from './inputs/event-input'
export {default as GroupInput} from './inputs/group-input'
export {default as MemberInput} from './inputs/member-input'
export {default as AttendeeInput} from './inputs/attendee-input'
export {default as SummitInput} from './inputs/summit-input'
export {default as SpeakerInput} from './inputs/speaker-input'
export {default as OperatorInput} from './inputs/operator-input'
export {default as TagInput} from './inputs/tag-input'
export {default as Input} from './inputs/text-input'
export {default as Panel} from './sections/panel'
export {default as SimpleLinkList} from './simple-link-list'
export {default as SummitDropdown} from './summit-dropdown'
export {default as Table} from './table/Table'
export {default as SortableTable} from './table-sortable/SortableTable'
export {default as EditableTable} from './table-editable/EditableTable'
export {default as SelectableTable} from './table-selectable/SelectableTable'
export {default as SimpleForm} from './forms/simple-form'
export {default as RsvpForm} from './forms/rsvp-form';
export {default as RadioList} from './inputs/radio-list'
export {default as CheckboxList} from './inputs/checkbox-list'
export {default as ActionDropdown} from './inputs/action-dropdown'
export {default as CountryInput} from './inputs/country-input'
export {default as LanguageInput} from './inputs/language-input'
export {default as FreeMultiTextInput} from "./inputs/free-multi-text-input";
export {default as Exclusive} from "./exclusive-wrapper";
export {default as Clock} from "./clock";
export {default as CircleButton} from "./circle-button";
export {default as VideoStream} from "./video-stream";
export {default as AttendanceTracker} from "./attendance-tracker";
export {default as AccessLevelsInput} from './inputs/access-levels-input';
export {default as RegistrationCompanyInput} from './inputs/registration-company-input';
export {default as TicketTypesInput} from './inputs/ticket-types-input.js'
export {default as SponsoredProjectInput} from './inputs/sponsored-project-input.js'
export {default as SteppedSelect} from './inputs/stepped-select/index.jsx'
export {default as SummitDaysSelect} from './inputs/summit-days-select'
export {default as SummitVenuesSelect} from './inputs/summit-venues-select'
export {default as BulkActionsSelector} from './bulk-actions-selector'
export {default as ScheduleBuilderView} from './schedule-builder-view'

// mui components
export {default as MuiCheckboxList} from './mui/checkbox-list'
export {default as MuiChipList} from './mui/chip-list'
export {default as MuiChipNotify} from './mui/chip-notify'
export {default as MuiChipSelectInput} from './mui/chip-select-input'
export {default as MuiConfirmDialog} from './mui/confirm-dialog'
export {GlobalConfirmDialog} from './mui/showConfirmDialog'
export {default as MuiCustomAlert} from './mui/custom-alert'
export {default as MuiDropdownCheckbox} from './mui/dropdown-checkbox'
export {default as MuiMenuButton} from './mui/menu-button'
export {default as MuiSearchInput} from './mui/search-input'
export {default as MuiShowConfirmDialog} from './mui/showConfirmDialog'
export {default as MuiSponsorAddonSelect} from './mui/sponsor-addon-select'
export {default as MuiSummitAddonSelect} from './mui/summit-addon-select'
export {default as MuiSummitsDropdown} from './mui/summits-dropdown'
export {default as MuiFormItemTable, getCurrentApplicableRate, isItemAvailable, GlobalQuantityField, ItemTableField, UnderlyingAlertNote} from './mui/FormItemTable'
export {default as MuiItemSettingsModal} from './mui/ItemSettingsModal'
export {default as MuiNotesModal} from './mui/NotesModal'
export {default as MuiSnackbarNotification} from './mui/SnackbarNotification'
export {useSnackbarMessage} from './mui/SnackbarNotification/Context'
export {default as MuiInfiniteTable} from './mui/infinite-table'
export {default as MuiEditableTable} from './mui/editable-table/mui-table-editable'
export {default as MuiTable} from './mui/table/mui-table'
export {TotalRow as MuiTotalRow, NotesRow as MuiNotesRow} from './mui/table/extra-rows'
export {default as MuiFormikAsyncSelect} from './mui/formik-inputs/mui-formik-async-select'
export {default as MuiFormikCheckboxGroup} from './mui/formik-inputs/mui-formik-checkbox-group'
export {default as MuiFormikCheckbox} from './mui/formik-inputs/mui-formik-checkbox'
export {default as MuiFormikColorInput} from './mui/formik-inputs/mui-formik-color-input'
export {default as MuiFormikDatepicker} from './mui/formik-inputs/mui-formik-datepicker'
export {default as MuiFormikDiscountField} from './mui/formik-inputs/mui-formik-discountfield'
export {default as MuiFormikDropdownCheckbox} from './mui/formik-inputs/mui-formik-dropdown-checkbox'
export {default as MuiFormikDropdownRadio} from './mui/formik-inputs/mui-formik-dropdown-radio'
export {default as MuiFormikFileSizeField} from './mui/formik-inputs/mui-formik-file-size-field'
export {default as MuiFormikPriceField} from './mui/formik-inputs/mui-formik-pricefield'
export {default as MuiFormikQuantityField} from './mui/formik-inputs/mui-formik-quantity-field'
export {default as MuiFormikRadioGroup} from './mui/formik-inputs/mui-formik-radio-group'
export {default as MuiFormikSelectGroup} from './mui/formik-inputs/mui-formik-select-group'
export {default as MuiFormikSelect} from './mui/formik-inputs/mui-formik-select'
export {default as MuiFormikSummitAddonSelect} from './mui/formik-inputs/mui-formik-summit-addon-select'
export {default as MuiFormikSwitch} from './mui/formik-inputs/mui-formik-switch'
export {default as MuiFormikTextField} from './mui/formik-inputs/mui-formik-textfield'
export {default as MuiFormikTimepicker} from './mui/formik-inputs/mui-formik-timepicker'
export {default as MuiFormikUpload} from './mui/formik-inputs/mui-formik-upload'
export {default as MuiCompanyInput} from './mui/formik-inputs/company-input-mui'
export {default as MuiItemPriceTiers} from './mui/formik-inputs/item-price-tiers'
export {default as MuiSponsorInput} from './mui/formik-inputs/mui-sponsor-input'
export {default as MuiSponsorshipInput} from './mui/formik-inputs/sponsorship-input-mui'
export {default as MuiSponsorshipSummitSelect} from './mui/formik-inputs/sponsorship-summit-select-mui'
export {default as MuiAlertButton} from './mui/AlertButton'
export {default as MuiAlertModal} from './mui/AlertModal'
export {default as MuiAuthButton} from './mui/AuthButton'
export {default as MuiCartButton} from './mui/CartButton'
export {default as MuiConfirmDeleteDialog} from './mui/ConfirmDeleteDialog'
export {default as MuiDashboardCard} from './mui/DashboardCard'
export {default as MuiDownloadBtn} from './mui/DownloadBtn'
export {default as MuiLoadingOverlay} from './mui/LoadingOverlay'
export {default as MuiNavBar} from './mui/NavBar'
export {default as MuiOrderSummary} from './mui/OrderSummary'
export {default as MuiStatusChip} from './mui/StatusChip'
export {default as MuiUploadBtn} from './mui/UploadBtn'
export {default as MuiUploadDialog} from './mui/UploadDialog'

// these include 3rd party deps
// export {default as ExtraQuestionsForm } from './extra-questions/index.js';
// export {default as GMap} from './google-map';
// export {default as TextEditorV2} from './inputs/editor-input-v2'
// export {default as TextEditorV3} from './inputs/editor-input-v3'
// export {default as CompanyInputV2} from './inputs/company-input-v2.js'
// export {default as MuiDndList} from './mui/dnd-list'                              // react-beautiful-dnd
// export {default as MuiSortableTable} from './mui/sortable-table/mui-table-sortable' // react-beautiful-dnd
// export {default as MuiStripePayment} from './mui/StripePayment'                   // @stripe/react-stripe-js, @stripe/stripe-js
// export {default as MuiAdditionalInput} from './mui/formik-inputs/additional-input/additional-input' // react-beautiful-dnd (via dnd-list)
// export {default as MuiAdditionalInputList} from './mui/formik-inputs/additional-input/additional-input-list' // react-beautiful-dnd (via dnd-list)

let language = getCurrentUserLanguage();

// language would be something like es-ES or es_ES
// However we store our files with format es.json or en.json
// therefore retrieve only the first 2 digits

if (language.length > 2) {
    language = language.split("-")[0];
    language = language.split("_")[0];
}

try {
    T.setTexts(require(`../i18n/${language}.json`));
} catch (e) {
    T.setTexts(require(`../i18n/en.json`));
}
