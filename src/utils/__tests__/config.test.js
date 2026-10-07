/**
 * setConfig lets a consumer hand uicore its app settings directly. A value
 * set this way wins over the matching window global; anything not set keeps
 * reading the global, so consumers that only plant globals are unaffected.
 */
import React from "react";
import Enzyme, { mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import {
  setConfig,
  getConfig,
  buildAPIBaseUrl,
  getTimeServiceUrl,
  getAllowedUserGroups,
  parseUserGroups,
  getOAuth2ClientId,
  getOAuth2Flow,
  useOAuth2RefreshToken,
  getOAuth2IDPBaseUrl,
  getOAuth2Scopes,
  getExclusiveSections,
} from "../config";
import Exclusive from "../../components/exclusive-wrapper";

Enzyme.configure({ adapter: new Adapter() });

const WINDOW_GLOBALS = {
  API_BASE_URL: "https://window.test",
  TIMEINTERVALSINCE1970_API_URL: "https://time.window",
  ALLOWED_USER_GROUPS: "window-group",
  OAUTH2_CLIENT_ID: "window-cid",
  OAUTH2_FLOW: "window-flow",
  OAUTH2_USE_REFRESH_TOKEN: true,
  IDP_BASE_URL: "https://idp.window",
  SCOPES: "window-scopes",
  EXCLUSIVE_SECTIONS: ["window-section"],
};

describe("setConfig", () => {
  beforeEach(() => Object.assign(window, WINDOW_GLOBALS));

  afterEach(() => {
    setConfig({});
    Object.keys(WINDOW_GLOBALS).forEach((k) => delete window[k]);
  });

  test("getConfig returns a copy of what was set; setConfig({}) clears it", () => {
    setConfig({ apiBaseUrl: "https://cfg.test" });
    expect(getConfig()).toEqual({ apiBaseUrl: "https://cfg.test" });
    getConfig().apiBaseUrl = "mutated";
    expect(getConfig()).toEqual({ apiBaseUrl: "https://cfg.test" });
    setConfig({});
    expect(getConfig()).toEqual({});
  });

  test("setConfig replaces the previous object instead of merging", () => {
    setConfig({ apiBaseUrl: "https://a.test" });
    setConfig({ scopes: "b" });
    expect(getConfig()).toEqual({ scopes: "b" });
    expect(buildAPIBaseUrl("/x")).toBe("https://window.test/x");
  });

  test("setConfig with null, undefined or an array clears the config", () => {
    setConfig({ apiBaseUrl: "https://a.test" });
    setConfig(null);
    expect(getConfig()).toEqual({});
    setConfig({ apiBaseUrl: "https://a.test" });
    setConfig();
    expect(getConfig()).toEqual({});
    setConfig(["x"]);
    expect(getConfig()).toEqual({});
  });

  test("a key that is not configured keeps reading the window global", () => {
    setConfig({ scopes: "openid" });
    expect(buildAPIBaseUrl("/x")).toBe("https://window.test/x");
    expect(getOAuth2Flow()).toBe("window-flow");
  });

  test("every configured value wins over its window global", () => {
    setConfig({
      apiBaseUrl: "https://cfg.test",
      timeApiUrl: "https://time.cfg",
      allowedUserGroups: "cfg-group",
      oauth2ClientId: "cfg-cid",
      oauth2Flow: "cfg-flow",
      oauth2UseRefreshToken: false,
      idpBaseUrl: "https://idp.cfg",
      scopes: "cfg-scopes",
      exclusiveSections: ["sponsors"],
    });
    expect(buildAPIBaseUrl("/x")).toBe("https://cfg.test/x");
    expect(getTimeServiceUrl()).toBe("https://time.cfg");
    expect(getAllowedUserGroups()).toBe("cfg-group");
    expect(getOAuth2ClientId()).toBe("cfg-cid");
    expect(getOAuth2Flow()).toBe("cfg-flow");
    expect(useOAuth2RefreshToken()).toBe(false);
    expect(getOAuth2IDPBaseUrl()).toBe("https://idp.cfg");
    expect(getOAuth2Scopes()).toBe("cfg-scopes");
    expect(getExclusiveSections()).toEqual(["sponsors"]);
    const tree = mount(<Exclusive name="sponsors"><span>x</span></Exclusive>);
    expect(tree.find("span")).toHaveLength(1);
  });

  test("falsy configured values (0, false, null) win over a truthy global", () => {
    setConfig({ scopes: null, oauth2UseRefreshToken: false, oauth2ClientId: 0 });
    expect(getOAuth2Scopes()).toBe(null);
    expect(useOAuth2RefreshToken()).toBe(false);
    expect(getOAuth2ClientId()).toBe(0);
  });

  test("undefined and empty-string values are treated as not set", () => {
    setConfig({ apiBaseUrl: undefined, allowedUserGroups: "" });
    expect(buildAPIBaseUrl("/x")).toBe("https://window.test/x");
    expect(getAllowedUserGroups()).toBe(window.ALLOWED_USER_GROUPS || "");
  });

  test("a config set through one module copy is visible to a second copy", () => {
    // The state rides globalThis under Symbol.for, so duplicate installs of
    // the package share it.
    setConfig({ oauth2ClientId: "shared-client" });
    let secondCopy;
    jest.isolateModules(() => {
      secondCopy = require("../config");
    });
    expect(secondCopy.getOAuth2ClientId()).toBe("shared-client");
  });
});

describe("parseUserGroups", () => {
  test("splits a space-separated string into a list", () => {
    expect(parseUserGroups("a b c")).toEqual(["a", "b", "c"]);
  });

  test("a single value yields a one-item list", () => {
    expect(parseUserGroups("staff")).toEqual(["staff"]);
  });

  test("a falsy value (empty string, null, undefined) yields an empty list", () => {
    expect(parseUserGroups("")).toEqual([]);
    expect(parseUserGroups(null)).toEqual([]);
    expect(parseUserGroups(undefined)).toEqual([]);
  });
});
