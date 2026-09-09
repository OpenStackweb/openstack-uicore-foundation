import React from "react";
import { Alert } from "@mui/material";
import StripePayment from "../src/components/mui/StripePayment";

export default {
  title: "MUI/Commerce/StripePayment",
  component: StripePayment,
  argTypes: { onPaymentSuccess: { action: "success" }, onPaymentError: { action: "error" } },
  parameters: {
    docs: {
      description: {
        component:
          "The only component here that cannot render standalone: Stripe Elements needs a real publishable key plus a client_secret from a server-created payment intent. Supply both via args to see the live card form."
      }
    }
  }
};

export const NeedsStripeCredentials = {
  render: (args) => (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>
        Renders blank without a real Stripe publishable key and client_secret. Set
        both in the Controls panel to load the live card form.
      </Alert>
      <StripePayment {...args} />
    </>
  ),
  args: {
    stripeFormTitle: "Card details",
    paymentProfile: { publishable_key: "" },
    paymentIntent: { client_secret: "" },
    paymentOptions: { currency: "USD", amount: 3350000 }
  }
};
