import CompanyInput from "../../src/components/inputs/company-input";
import PromocodeInput from "../../src/components/inputs/promocode-input";
import SponsorInput from "../../src/components/inputs/sponsor-input";
import OrganizationInput from "../../src/components/inputs/organization-input";
import EventInput from "../../src/components/inputs/event-input";
import GroupInput from "../../src/components/inputs/group-input";
import MemberInput from "../../src/components/inputs/member-input";
import AttendeeInput from "../../src/components/inputs/attendee-input";
import SummitInput from "../../src/components/inputs/summit-input";
import SpeakerInput from "../../src/components/inputs/speaker-input";
import OperatorInput from "../../src/components/inputs/operator-input";
import TagInput from "../../src/components/inputs/tag-input";
import AccessLevelsInput from "../../src/components/inputs/access-levels-input";
import RegistrationCompanyInput from "../../src/components/inputs/registration-company-input";
import TicketTypesInput from "../../src/components/inputs/ticket-types-input.js";
import SponsoredProjectInput from "../../src/components/inputs/sponsored-project-input.js";
import CountryInput from "../../src/components/inputs/country-input";
import LanguageInput from "../../src/components/inputs/language-input";
import CountryDropdown from "../../src/components/inputs/country-dropdown";
import { NEEDS_API } from "../_helpers";

/**
 * Every input here is an async select over utils/query-actions — one story each
 * would be 19 near-identical files, so they share this one. NEEDS_API applies
 * to all of them: they render and open, but option lists stay empty offline.
 */
export default {
  title: "Core/Inputs/AsyncEntityInputs",
  parameters: { docs: { description: { component: NEEDS_API } } },
  argTypes: { onChange: { action: "changed" } }
};

const base = { value: null, placeholder: "Type to search..." };

export const Company = { render: (args) => <CompanyInput id="company" {...base} {...args} /> };
export const Promocode = { render: (args) => <PromocodeInput id="promocode" summitId={13} {...base} {...args} /> };
export const Sponsor = { render: (args) => <SponsorInput id="sponsor" summitId={13} {...base} {...args} /> };
export const Organization = { render: (args) => <OrganizationInput id="organization" {...base} {...args} /> };
export const Event = { render: (args) => <EventInput id="event" summit={{ id: 13 }} {...base} {...args} /> };
export const Group = { render: (args) => <GroupInput id="group" {...base} {...args} /> };
export const Member = { render: (args) => <MemberInput id="member" {...base} {...args} /> };
export const Attendee = { render: (args) => <AttendeeInput id="attendee" summitId={13} {...base} {...args} /> };
export const Summit = { render: (args) => <SummitInput id="summit" {...base} {...args} /> };
export const Speaker = { render: (args) => <SpeakerInput id="speaker" summitId={13} {...base} {...args} /> };
export const Operator = { render: (args) => <OperatorInput id="operator" {...base} {...args} /> };
export const Tag = {
  render: (args) => <TagInput id="tags" value={[]} onCreate={() => {}} {...args} />
};
export const AccessLevels = { render: (args) => <AccessLevelsInput id="access_levels" summitId={13} {...base} {...args} /> };
export const RegistrationCompany = {
  render: (args) => (
    <RegistrationCompanyInput id="reg_company" summitId={13} onError={() => {}} {...base} {...args} />
  )
};
export const TicketTypes = { render: (args) => <TicketTypesInput id="ticket_types" summitId={13} value={[]} {...args} /> };
export const SponsoredProject = { render: (args) => <SponsoredProjectInput id="sponsored_project" {...base} {...args} /> };
export const Country = { render: (args) => <CountryInput id="country" {...base} {...args} /> };
export const Language = { render: (args) => <LanguageInput id="language" {...base} {...args} /> };
export const CountrySelect = { render: (args) => <CountryDropdown id="country_dd" value="" {...args} /> };
