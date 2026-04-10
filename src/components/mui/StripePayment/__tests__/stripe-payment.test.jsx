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

jest.mock("@stripe/stripe-js", () => ({
  loadStripe: jest.fn(() => Promise.resolve({}))
}));

jest.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }) => <div data-testid="stripe-elements">{children}</div>
}));

jest.mock("../stripe-form", () => () => <div data-testid="stripe-form" />);

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import StripePayment from "../index";

const paymentProfile = {
  test_mode_enabled: true,
  test_publishable_key: "pk_test_123",
  live_publishable_key: "pk_live_456"
};

const paymentIntent = {
  client_secret: "cs_test_abc",
  total_amount: 5000
};

const defaultProps = {
  paymentProfile,
  paymentIntent,
  client: { first_name: "Jane", last_name: "Doe", email: "jane@example.com", address: {} },
  redirectUrl: "/success",
  onPaymentSuccess: jest.fn(),
  onPaymentError: jest.fn(),
  updatePaymentIntent: jest.fn()
};

describe("StripePayment", () => {
  test("returns null when paymentProfile is not provided", () => {
    const { container } = render(<StripePayment {...defaultProps} paymentProfile={null} />);
    expect(container.firstChild).toBeNull();
  });

  test("returns null when paymentIntent is not provided", () => {
    const { container } = render(<StripePayment {...defaultProps} paymentIntent={null} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders Elements and StripeForm when both props are provided", () => {
    render(<StripePayment {...defaultProps} />);
    expect(screen.getByTestId("stripe-elements")).toBeInTheDocument();
    expect(screen.getByTestId("stripe-form")).toBeInTheDocument();
  });

  test("uses test key when test_mode_enabled is true", () => {
    const { loadStripe } = require("@stripe/stripe-js");
    render(<StripePayment {...defaultProps} />);
    expect(loadStripe).toHaveBeenCalledWith("pk_test_123");
  });

  test("uses live key when test_mode_enabled is false", () => {
    const { loadStripe } = require("@stripe/stripe-js");
    loadStripe.mockClear();
    render(
      <StripePayment
        {...defaultProps}
        paymentProfile={{ ...paymentProfile, test_mode_enabled: false }}
      />
    );
    expect(loadStripe).toHaveBeenCalledWith("pk_live_456");
  });
});
