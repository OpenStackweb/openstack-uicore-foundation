/**
 * AttendanceTracker reads the access token through security/methods.getAccessToken,
 * so a registered resolver must be what the metrics calls send.
 * superagent is mocked; the token path is real.
 */
import React from "react";
import { render, act } from "@testing-library/react";
import http from "superagent/lib/client";
import { setAccessTokenResolver } from "../security/methods";
import AttendanceTracker from "../attendance-tracker";

jest.mock("superagent/lib/client", () => {
  const end = jest.fn();
  const send = jest.fn(() => ({ end }));
  return { put: jest.fn(() => ({ send })), post: jest.fn(() => ({ send })), __send: send };
});

const flush = async () => {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0));
};

describe("AttendanceTracker with an access-token resolver", () => {
  const props = { apiBaseUrl: "https://api.test", summitId: 13, sourceId: 7, sourceName: "EVENT" };

  beforeEach(() => {
    jest.clearAllMocks();
    navigator.sendBeacon = jest.fn();
  });

  afterEach(() => setAccessTokenResolver(null));

  test("enter, leave and the unload beacon all send the resolver's token", async () => {
    const resolver = jest.fn(() => Promise.resolve("RES-TOK"));
    setAccessTokenResolver(resolver);

    const { unmount } = render(<AttendanceTracker {...props} />);
    await act(flush);
    expect(http.put).toHaveBeenCalledWith("https://api.test/api/v1/summits/13/metrics/enter");
    expect(http.__send).toHaveBeenCalledWith(
      expect.objectContaining({ access_token: "RES-TOK", type: "EVENT", source_id: 7 })
    );

    await act(async () => {
      window.dispatchEvent(new Event("beforeunload"));
      await flush();
    });
    const beaconUrl = navigator.sendBeacon.mock.calls[0][0];
    expect(beaconUrl).toContain("/api/v1/summits/13/metrics/leave?access_token=RES-TOK");

    jest.clearAllMocks();
    unmount();
    await act(flush);
    expect(http.post).toHaveBeenCalledWith("https://api.test/api/v1/summits/13/metrics/leave");
    expect(http.__send).toHaveBeenCalledWith(expect.objectContaining({ access_token: "RES-TOK" }));
  });
});
