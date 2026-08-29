/**
 * Every app-level setting uicore needs is read from a window global. These
 * tests pin which global each getter reads and what it returns when the
 * global is unset.
 */
import React from "react";
import { render } from "@testing-library/react";
import {
  buildAPIBaseUrl,
  getTimeServiceUrl,
  getAllowedUserGroups,
  getOAuth2ClientId,
  getOAuth2Flow,
  useOAuth2RefreshToken,
  getOAuth2IDPBaseUrl,
  getOAuth2Scopes,
  getFileUploadApiBaseUrl,
} from "../config";
import * as utilsMethods from "../methods";
import * as securityMethods from "../../components/security/methods";
import Exclusive from "../../components/exclusive-wrapper";

const GLOBALS = [
  "API_BASE_URL", "TIMEINTERVALSINCE1970_API_URL", "ALLOWED_USER_GROUPS",
  "OAUTH2_CLIENT_ID", "OAUTH2_FLOW", "OAUTH2_USE_REFRESH_TOKEN", "IDP_BASE_URL",
  "SCOPES", "EXCLUSIVE_SECTIONS", "FILE_UPLOAD_API_BASE_URL",
];

describe("config reads from window globals", () => {
  let origEnvTime;

  beforeEach(() => {
    origEnvTime = process.env.TIMEINTERVALSINCE1970_API_URL;
    delete process.env.TIMEINTERVALSINCE1970_API_URL;
    GLOBALS.forEach((k) => delete window[k]);
  });

  afterEach(() => {
    if (origEnvTime === undefined) delete process.env.TIMEINTERVALSINCE1970_API_URL;
    else process.env.TIMEINTERVALSINCE1970_API_URL = origEnvTime;
    GLOBALS.forEach((k) => delete window[k]);
  });

  test("buildAPIBaseUrl prepends window.API_BASE_URL", () => {
    window.API_BASE_URL = "https://api.test";
    expect(buildAPIBaseUrl("/api/v1/summits")).toBe("https://api.test/api/v1/summits");
  });

  test("getTimeServiceUrl reads window.TIMEINTERVALSINCE1970_API_URL, else the env var", () => {
    window.TIMEINTERVALSINCE1970_API_URL = "https://time.test";
    expect(getTimeServiceUrl()).toBe("https://time.test");
    delete window.TIMEINTERVALSINCE1970_API_URL;
    process.env.TIMEINTERVALSINCE1970_API_URL = "https://time.env";
    expect(getTimeServiceUrl()).toBe("https://time.env");
  });

  test("getAllowedUserGroups reads window.ALLOWED_USER_GROUPS, else ''", () => {
    expect(getAllowedUserGroups()).toBe("");
    window.ALLOWED_USER_GROUPS = "admins";
    expect(getAllowedUserGroups()).toBe("admins");
  });

  test("getOAuth2ClientId reads window.OAUTH2_CLIENT_ID", () => {
    window.OAUTH2_CLIENT_ID = "cid";
    expect(getOAuth2ClientId()).toBe("cid");
  });

  test("getOAuth2Flow reads window.OAUTH2_FLOW, else 'token id_token'", () => {
    expect(getOAuth2Flow()).toBe("token id_token");
    window.OAUTH2_FLOW = "code";
    expect(getOAuth2Flow()).toBe("code");
  });

  test("useOAuth2RefreshToken is truthy from the window global, even when it is false", () => {
    expect(useOAuth2RefreshToken()).toBeTruthy();
    window.OAUTH2_USE_REFRESH_TOKEN = false;
    expect(useOAuth2RefreshToken()).toBeTruthy();
  });

  test("getOAuth2IDPBaseUrl reads window.IDP_BASE_URL", () => {
    window.IDP_BASE_URL = "https://idp.test";
    expect(getOAuth2IDPBaseUrl()).toBe("https://idp.test");
  });

  test("getOAuth2Scopes reads window.SCOPES", () => {
    window.SCOPES = "openid profile";
    expect(getOAuth2Scopes()).toBe("openid profile");
  });

  test("getFileUploadApiBaseUrl reads window.FILE_UPLOAD_API_BASE_URL", () => {
    window.FILE_UPLOAD_API_BASE_URL = "https://files.test";
    expect(getFileUploadApiBaseUrl()).toBe("https://files.test");
  });

  test("Exclusive renders its children only when window.EXCLUSIVE_SECTIONS lists the name", () => {
    const spans = () => render(<Exclusive name="sponsors"><span>x</span></Exclusive>).container.querySelectorAll("span");
    expect(spans()).toHaveLength(0);
    window.EXCLUSIVE_SECTIONS = ["sponsors"];
    expect(spans()).toHaveLength(1);
  });

  test("the getters stay exported from utils/methods and security/methods", () => {
    expect(utilsMethods.buildAPIBaseUrl).toBe(buildAPIBaseUrl);
    expect(utilsMethods.getTimeServiceUrl).toBe(getTimeServiceUrl);
    expect(utilsMethods.getAllowedUserGroups).toBe(getAllowedUserGroups);
    expect(securityMethods.getOAuth2ClientId).toBe(getOAuth2ClientId);
    expect(securityMethods.getOAuth2Flow).toBe(getOAuth2Flow);
    expect(securityMethods.useOAuth2RefreshToken).toBe(useOAuth2RefreshToken);
    expect(securityMethods.getOAuth2IDPBaseUrl).toBe(getOAuth2IDPBaseUrl);
    expect(securityMethods.getOAuth2Scopes).toBe(getOAuth2Scopes);
  });
});
