import RsvpForm from "../../src/components/forms/rsvp-form";

export default {
  title: "Core/Forms/RsvpForm",
  component: RsvpForm,
  argTypes: { onSubmit: { action: "submit" } }
};

export const Default = {
  args: {
    errors: {},
    questions: [
      { id: 1, class_name: "RSVPTextBoxQuestionTemplate", name: "full_name", label: "Full name", is_mandatory: true },
      { id: 2, class_name: "RSVPTextAreaQuestionTemplate", name: "dietary", label: "Dietary requirements", is_mandatory: false }
    ]
  }
};
