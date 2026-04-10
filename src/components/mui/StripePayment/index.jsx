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

import React, { useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeForm from "./stripe-form";

const StripePayment = ({
  paymentIntent,
  paymentProfile,
  client,
  redirectUrl,
  stripeFormTitle,
  onPaymentSuccess,
  onPaymentError,
  updatePaymentIntent
}) => {
  const { test_mode_enabled, test_publishable_key, live_publishable_key } = paymentProfile || {};
  const providerKey = test_mode_enabled ? test_publishable_key : live_publishable_key;
  const stripePromise = useMemo(
    () => (providerKey ? loadStripe(providerKey) : null),
    [providerKey]
  );

  if (!paymentProfile || !paymentIntent?.client_secret || !providerKey) return null;

  const options = {
    clientSecret: paymentIntent.client_secret,
    appearance: { theme: "stripe" }
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripeForm
        title={stripeFormTitle}
        client={client}
        amount={paymentIntent.total_amount}
        redirectUrl={redirectUrl}
        onSuccess={onPaymentSuccess}
        onError={onPaymentError}
        onPaymentMethodChange={updatePaymentIntent}
      />
    </Elements>
  );
};

export default StripePayment;
