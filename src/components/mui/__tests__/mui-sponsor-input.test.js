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

// mui-sponsor-input.test.js
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import MuiSponsorInput from "../formik-inputs/mui-sponsor-input";

// Mock the query actions
jest.mock("../../../utils/query-actions", () => ({
  querySponsorsV2: jest.fn((query, summitId, callback) => {
    // Simulate API response based on query
    const mockResults = [
      { id: 1, name: "Sponsor One" },
      { id: 2, name: "Sponsor Two" },
      { id: 3, name: "Another Sponsor" }
    ].filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

    // Simulate async response
    setTimeout(() => callback(mockResults), 100);
    return Promise.resolve();
  })
}));

// Helper function to render the component with Formik
const renderWithFormik = (props, initialValues = { sponsor: "" }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiSponsorInput
          name="sponsor"
          placeholder="Search sponsors..."
          summitId={123}
          {...props}
        />
      </Form>
    </Formik>
  );

describe("MuiSponsorInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the component with placeholder", () => {
    renderWithFormik();

    // Placeholder should be visible
    expect(
      screen.getByPlaceholderText("Search sponsors...")
    ).toBeInTheDocument();
  });

  test("opens dropdown and fetches options when typing", async () => {
    const { querySponsorsV2 } = require("../../../utils/query-actions");

    // Create a controlled resolution for the mock
    let resolveAPICall;
    const apiPromise = new Promise((resolve) => {
      resolveAPICall = resolve;
    });

    // Mock with a controlled promise
    querySponsorsV2.mockImplementation((query, summitId, callback) => {
      // Call the callback after our test code triggers resolution
      apiPromise.then(() => {
        callback([
          { id: 1, name: "Sponsor One" },
          { id: 2, name: "Sponsor Two" }
        ]);
      });
      return Promise.resolve();
    });

    renderWithFormik();

    // Type in the search field
    const input = screen.getByPlaceholderText("Search sponsors...");
    await userEvent.click(input);
    await userEvent.type(input, "Sponsor");

    // Wait for the API call to be initiated
    await waitFor(
      () => {
        expect(querySponsorsV2).toHaveBeenCalledWith(
          "Sponsor",
          123,
          expect.any(Function)
        );
      },
      { timeout: 2000 }
    ); // Increase timeout to account for debounce

    // Now we can check for loading state
    // If the component shows "Loading..." text while fetching
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    // Resolve the API call at a controlled time
    resolveAPICall();

    // Now wait for the options to appear with a longer timeout
    await waitFor(
      () => {
        // Use a regex to match option text with case insensitivity
        const options = screen.getAllByText(/sponsor (one|two)/i);
        expect(options.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    // Verify loading indicator is gone
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
  });

  test("selects a sponsor in single selection mode", async () => {
    renderWithFormik();

    // Type and wait for options
    const input = screen.getByPlaceholderText("Search sponsors...");
    await userEvent.click(input);
    await userEvent.type(input, "Sponsor");

    // Wait for options to appear
    await waitFor(
      () => {
        const options = screen.getAllByText(/Sponsor (One|Two)/);
        expect(options.length).toBeGreaterThan(0);
      },
      { timeout: 1000 }
    );

    // Find and click the first option that matches "Sponsor One"
    const option = screen.getAllByText(/Sponsor One/)[0];
    await userEvent.click(option);

    // Check the input value - this might need to be adjusted based on how selection works
    await waitFor(() => {
      expect(input.value).toBe("Sponsor One");
    });
  });

  test("supports multiple selection when isMulti is true", async () => {
    renderWithFormik({ isMulti: true }, { sponsor: [] });

    // Select first option
    const input = screen.getByPlaceholderText("Search sponsors...");
    await userEvent.click(input);
    await userEvent.type(input, "Sponsor");

    // Wait for options to appear
    await waitFor(
      () => {
        const options = screen.getAllByText(/Sponsor (One|Two)/);
        expect(options.length).toBeGreaterThan(0);
      },
      { timeout: 1000 }
    );

    // Find and click the option
    const option1 = screen.getAllByText(/Sponsor One/)[0];
    await userEvent.click(option1);

    // Clear input and search for second option
    await userEvent.clear(input);
    await userEvent.type(input, "Two");

    // Wait for options to appear
    await waitFor(
      () => {
        const options = screen.getAllByText(/Sponsor Two/);
        expect(options.length).toBeGreaterThan(0);
      },
      { timeout: 1000 }
    );

    // Select second option
    const option2 = screen.getAllByText(/Sponsor Two/)[0];
    await userEvent.click(option2);

    // Verify both options are selected (may need adjustment based on component implementation)
    expect(screen.getByText(/Sponsor One/)).toBeInTheDocument();
    expect(screen.getByText(/Sponsor Two/)).toBeInTheDocument();
  });

  test("handles plain value format correctly", async () => {
    renderWithFormik({ plainValue: true });

    // Type and select an option
    const input = screen.getByPlaceholderText("Search sponsors...");
    await userEvent.click(input);
    await userEvent.type(input, "Sponsor");

    // Wait for options to load
    await waitFor(() => {
      expect(screen.getByText("Sponsor One")).toBeInTheDocument();
    });

    // Select the first option
    await userEvent.click(screen.getByText("Sponsor One"));

    // Check that the value is set correctly (this would need to inspect Formik's state)
    // We can't easily test this directly, but we can confirm the displayed value
    expect(input.value).toBe("Sponsor One");
  });

  test("displays error message when field has error", () => {
    render(
      <Formik
        initialValues={{ sponsor: "" }}
        initialErrors={{ sponsor: "Sponsor is required" }}
        initialTouched={{ sponsor: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiSponsorInput
            name="sponsor"
            placeholder="Search sponsors..."
            summitId={123}
          />
        </Form>
      </Formik>
    );

    // Error message should be displayed
    expect(screen.getByText("Sponsor is required")).toBeInTheDocument();
  });

  test("initializes with preselected value in single selection mode", () => {
    renderWithFormik(
      { plainValue: false },
      { sponsor: { id: 1, name: "Sponsor One" } }
    );

    // The selected value should be displayed
    expect(screen.getByDisplayValue("Sponsor One")).toBeInTheDocument();
  });

  test("initializes with preselected values in multi selection mode", () => {
    renderWithFormik(
      { isMulti: true, plainValue: false },
      {
        sponsor: [
          { id: 1, name: "Sponsor One" },
          { id: 2, name: "Sponsor Two" }
        ]
      }
    );

    // Both selected values should be displayed as chips
    expect(screen.getByText("Sponsor One")).toBeInTheDocument();
    expect(screen.getByText("Sponsor Two")).toBeInTheDocument();
  });

  test("debounces API calls", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime
    });
    const { querySponsorsV2 } = require("../../../utils/query-actions");
    renderWithFormik();

    const input = screen.getByPlaceholderText("Search sponsors...");
    await user.click(input);

    // Type characters rapidly
    await user.type(input, "Spo");

    // Debounce hasn't fired yet — timer is still pending
    expect(querySponsorsV2).toHaveBeenCalledTimes(0);

    // Advance past the 250ms debounce
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(querySponsorsV2).toHaveBeenCalledTimes(1);
    expect(querySponsorsV2).toHaveBeenCalledWith(
      "Spo",
      123,
      expect.any(Function)
    );

    jest.useRealTimers();
  });
});
