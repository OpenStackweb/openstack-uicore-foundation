/**
 * Copyright 2026 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import React, {useEffect, useState} from "react";
import {Box, Button, Typography} from "@mui/material";
import T from "i18n-react";
import {PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {currencyAmountFromCents} from "../../../utils/money";
import {handleSentryException} from "../../../utils/methods";

const buildAddress = (userAddress) => {
  const address = {};
  // stripe payment payload requires data that's not an empty string
  if (userAddress.locality) address.city = userAddress.locality;
  if (userAddress.country) address.country = userAddress.country;
  if (userAddress.address1) address.line1 = userAddress.address1;
  if (userAddress.address2) address.line2 = userAddress.address2;
  if (userAddress.postal_code) address.postal_code = userAddress.postal_code;
  if (userAddress.region) address.state = userAddress.region;

  if (Object.keys(address).length > 0) return {address};
  return {};
};

const StripeForm = ({
                      amount = 0,
                      client,
                      redirectUrl,
                      onSuccess,
                      onError,
                      onPaymentMethodChange
                    }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (elements) {
      const pe = elements.getElement("payment");
      const handlePaymentMethodChange = (event) => {
        if (event.value.type) {
          onPaymentMethodChange(event.value.type);
        }
      };

      pe.on("change", handlePaymentMethodChange);

      return () => {
        pe.off("change", handlePaymentMethodChange);
      };
    }
  }, [elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || loading) return;

    setLoading(true);

    const {error, paymentIntent} = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${redirectUrl}`,
        payment_method_data: {
          billing_details: {
            name: `${client.first_name} ${client.last_name}`,
            email: client.email,
            ...buildAddress(client.address)
          }
        }
      },
      redirect: "if_required"
    });

    if (error) {
      onError?.(error.message);
      setLoading(false);
    } else if (paymentIntent?.status === "succeeded") {
      try {
        await onSuccess?.(paymentIntent);
      } catch (err) {
        handleSentryException(err);
        onError?.(T.translate("stripe_form.payment_confirmation_error"));
        // Do not call setLoading(false) — payment already succeeded, keep form locked
      }
      // On success, keep loading=true so the button stays disabled until navigation
    } else if (paymentIntent?.status === "processing") {
      // Payment is async and still in flight — keep the form locked
    } else {
      // Genuinely retryable statuses (e.g. requires_action) — re-enable submission
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{p: 3}}>
      <Typography sx={{mb: 2}}>{T.translate("stripe_form.title")}</Typography>

      <PaymentElement
        options={{
          layout: "tabs"
        }}
      />

      <Button
        fullWidth
        type="submit"
        variant="contained"
        disabled={!stripe || loading}
      >
        {loading ? T.translate("stripe_form.processing") : T.translate("stripe_form.button_cta", {amount: currencyAmountFromCents(amount)})}
      </Button>
    </Box>
  );
};

export default StripeForm;
