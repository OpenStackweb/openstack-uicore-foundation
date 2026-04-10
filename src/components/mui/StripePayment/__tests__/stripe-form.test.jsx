import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import StripeForm from "../stripe-form";
import { handleSentryException } from "../helpers";

jest.mock("i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

jest.mock("../helpers", () => ({
  handleSentryException: jest.fn()
}));

jest.mock("../../../../utils/money", () => ({
  currencyAmountFromCents: (amount) => `$${amount}`
}));

const mockConfirmPayment = jest.fn();
const mockOn = jest.fn();
const mockOff = jest.fn();

jest.mock("@stripe/react-stripe-js", () => ({
  PaymentElement: () => <div data-testid="payment-element" />,
  useStripe: () => ({ confirmPayment: mockConfirmPayment }),
  useElements: () => ({
    getElement: () => ({ on: mockOn, off: mockOff })
  })
}));

const defaultProps = {
  amount: 5000,
  client: {
    first_name: "Jane",
    last_name: "Doe",
    email: "jane@example.com",
    address: {}
  },
  redirectUrl: "/dashboard",
  onSuccess: jest.fn(),
  onError: jest.fn(),
  onPaymentMethodChange: jest.fn()
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("StripeForm payment button state", () => {
  it("stays disabled after successful payment", async () => {
    const onSuccess = jest.fn().mockResolvedValue(undefined);
    mockConfirmPayment.mockResolvedValue({
      paymentIntent: { id: "pi_123", status: "succeeded" }
    });

    render(<StripeForm {...defaultProps} onSuccess={onSuccess} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    expect(button).toBeDisabled();
  });

  it("re-enables on payment error so the user can retry", async () => {
    mockConfirmPayment.mockResolvedValue({
      error: { message: "Your card was declined." }
    });

    render(<StripeForm {...defaultProps} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() =>
      expect(defaultProps.onError).toHaveBeenCalledWith(
        "Your card was declined."
      )
    );

    expect(button).not.toBeDisabled();
  });

  it("keeps disabled, reports to Sentry, and calls onError if onSuccess throws", async () => {
    const backendError = new Error("Backend error");
    const onSuccess = jest.fn().mockRejectedValue(backendError);
    mockConfirmPayment.mockResolvedValue({
      paymentIntent: { id: "pi_456", status: "succeeded" }
    });

    render(<StripeForm {...defaultProps} onSuccess={onSuccess} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    expect(handleSentryException).toHaveBeenCalledWith(backendError);
    expect(defaultProps.onError).toHaveBeenCalledWith(
      "stripe_form.payment_confirmation_error"
    );
    expect(button).toBeDisabled();
  });

  it("re-enables button for retryable status 'requires_action'", async () => {
    mockConfirmPayment.mockResolvedValue({
      paymentIntent: { id: "pi_999", status: "requires_action" }
    });

    render(<StripeForm {...defaultProps} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => expect(button).not.toBeDisabled());
    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    expect(defaultProps.onError).not.toHaveBeenCalled();
  });

  it("keeps button disabled for async 'processing' status", async () => {
    mockConfirmPayment.mockResolvedValue({
      paymentIntent: { id: "pi_999", status: "processing" }
    });

    render(<StripeForm {...defaultProps} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => expect(mockConfirmPayment).toHaveBeenCalled());
    expect(button).toBeDisabled();
    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    expect(defaultProps.onError).not.toHaveBeenCalled();
  });

  it("blocks a second submit while confirmPayment is still in flight", async () => {
    const onSuccess = jest.fn().mockResolvedValue(undefined);
    let resolveConfirmPayment;
    mockConfirmPayment.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveConfirmPayment = resolve;
        })
    );

    render(<StripeForm {...defaultProps} onSuccess={onSuccess} />);

    const button = screen.getByRole("button");
    const form = button.closest("form");
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(mockConfirmPayment).toHaveBeenCalledTimes(1);

    resolveConfirmPayment({
      paymentIntent: { id: "pi_789", status: "succeeded" }
    });
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
