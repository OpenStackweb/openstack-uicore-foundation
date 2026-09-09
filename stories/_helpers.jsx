import React from "react";
import { Formik, Form } from "formik";

/**
 * Formik-bound inputs read from context, so every formik-inputs story needs a
 * host form. Usage: decorators: [withFormik({ myField: "value" })]
 */
export const withFormik =
  (initialValues = {}, formProps = {}) =>
  (Story) => (
    <Formik initialValues={initialValues} onSubmit={() => {}} {...formProps}>
      <Form>
        <Story />
      </Form>
    </Formik>
  );

/** Table rows have to live inside a table to render at all. */
export const inTable = (Story) => (
  <table style={{ width: "100%" }}>
    <tbody>
      <Story />
    </tbody>
  </table>
);

/** Components that fetch on mount have no backend here — see docs note on each. */
export const NEEDS_API =
  "Fetches on mount via utils/query-actions. With no API reachable from Storybook it renders its empty state; wire msw to populate it.";

export const sampleRows = [
  { id: 1, name: "Diamond Sponsorship", quantity: 2, price: 25000 },
  { id: 2, name: "Booth 10x10", quantity: 1, price: 8000 },
  { id: 3, name: "Lanyard Branding", quantity: 4, price: 1500 }
];

export const sampleColumns = [
  { columnKey: "name", header: "Item", sortable: true },
  { columnKey: "quantity", header: "Qty", align: "right" },
  { columnKey: "price", header: "Price", align: "right" }
];
