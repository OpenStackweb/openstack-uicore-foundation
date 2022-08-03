import React from 'react';
import T from 'i18n-react';

import  AjaxLoader  from './components/ajaxloader';
import RawHTML from './components/raw-html/index';
import FreeTextSearch from './components/free-text-search/index';
import GMap from './components/google-map/index';
import DateTimePicker from './components/inputs/datetimepicker/index'
import GroupedDropdown from './components/inputs/grouped-dropdown/index'
import UploadInput from './components/inputs/upload-input/index'
import UploadInputV2 from './components/inputs/upload-input-v2/index'
import CompanyInput from './components/inputs/company-input'
import SponsorInput from './components/inputs/sponsor-input'
import OrganizationInput from './components/inputs/organization-input'
import CountryDropdown from './components/inputs/country-dropdown'
import Dropdown from './components/inputs/dropdown'
import TextEditor from './components/inputs/editor-input'
import TextArea from './components/inputs/textarea-input'
import EventInput from './components/inputs/event-input'
import GroupInput from './components/inputs/group-input'
import MemberInput from './components/inputs/member-input'
import SummitInput from './components/inputs/summit-input'
import SpeakerInput from './components/inputs/speaker-input'
import TagInput from './components/inputs/tag-input'
import Input from './components/inputs/text-input'
import Panel from './components/sections/panel'
import SimpleLinkList from './components/simple-link-list/index'
import SummitDropdown from './components/summit-dropdown/index'
import Table from './components/table/Table'
import SortableTable from './components/table-sortable/SortableTable'
import EditableTable from './components/table-editable/EditableTable'
import SelectableTable from './components/table-selectable/SelectableTable'
import SimpleForm from './components/forms/simple-form'
import RsvpForm from './components/forms/rsvp-form';
import RadioList from './components/inputs/radio-list'
import CheckboxList from './components/inputs/checkbox-list'
import ActionDropdown from './components/inputs/action-dropdown'
import CountryInput from './components/inputs/country-input'
import LanguageInput from './components/inputs/language-input'
import FreeMultiTextInput from "./components/inputs/free-multi-text-input";
import OPSessionChecker from "./components/security/session-checker/op-session-checker";
import AbstractAuthorizationCallbackRoute from  "./components/security/abstract-auth-callback-route";
import Exclusive from "./components/exclusive-wrapper";
import FragmentParser from "./components/fragment-parser";
import Clock from "./components/clock";
import CircleButton from "./components/circle-button";
import VideoStream from "./components/video-stream";
import AttendanceTracker from "./components/attendance-tracker";
import {getCurrentUserLanguage} from './utils/methods';
import useFitText from './components/use-fit-text';
import AccessLevelsInput from './components/inputs/access-levels-input';
import TicketTypesInput from './components/inputs/ticket-types-input';
import ExtraQuestionsForm from './components/extra-questions';
import RegistrationCompanyInput from './components/inputs/registration-company-input';
import SponsoredProjectInput from './components/inputs/sponsored-project-input';

let language = getCurrentUserLanguage();

// language would be something like es-ES or es_ES
// However we store our files with format es.json or en.json
// therefore retrieve only the first 2 digits

if (language.length > 2) {
    language = language.split("-")[0];
    language = language.split("_")[0];
}

try {
    T.setTexts(require(`./i18n/${language}.json`));
} catch (e) {
    T.setTexts(require(`./i18n/en.json`));
}

export {
    AjaxLoader,
    RawHTML,
    FreeTextSearch,
    GMap,
    DateTimePicker,
    GroupedDropdown,
    UploadInput,
    UploadInputV2,
    CompanyInput,
    SponsorInput,
    CountryInput,
    LanguageInput,
    OrganizationInput,
    CountryDropdown,
    Dropdown,
    EventInput,
    GroupInput,
    SummitInput,
    MemberInput,
    SpeakerInput,
    TagInput,
    TextEditor,
    TextArea,
    Input,
    Panel,
    SimpleLinkList,
    SummitDropdown,
    Table,
    SortableTable,
    EditableTable,
    SimpleForm,
    RsvpForm,
    RadioList,
    CheckboxList,
    ActionDropdown,
    FreeMultiTextInput,
    OPSessionChecker,
    AbstractAuthorizationCallbackRoute,
    Exclusive,
    FragmentParser,
    Clock,
    CircleButton,
    VideoStream,
    AttendanceTracker,
    SelectableTable,
    useFitText,
    AccessLevelsInput,
    TicketTypesInput,
    ExtraQuestionsForm,
    RegistrationCompanyInput,
    SponsoredProjectInput,
};
