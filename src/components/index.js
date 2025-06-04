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

// this 5 includes 3rd party deps
// export {default as ExtraQuestionsForm } from './extra-questions/index.js';
// export {default as GMap} from './google-map';
// export {default as TextEditorV2} from './inputs/editor-input-v2'
// export {default as TextEditorV3} from './inputs/editor-input-v3'
// export {default as CompanyInputV2} from './inputs/company-input-v2.js'

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
