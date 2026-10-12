import SimpleForm from "../../src/components/forms/simple-form";

export default {
  title: "Core/Forms/SimpleForm",
  component: SimpleForm,
  argTypes: { onSubmit: { action: "submit" } }
};

export const Default = {
  args: {
    entity: { id: 7, name: "Gold Sponsorship", description: "Includes booth and 4 passes." },
    errors: {},
    fields: [
      { type: "text", name: "name", label: "Name" },
      { type: "textarea", name: "description", label: "Description" }
    ]
  }
};

export const WithErrors = {
  args: { ...Default.args, errors: { name: "Name is required" } }
};
