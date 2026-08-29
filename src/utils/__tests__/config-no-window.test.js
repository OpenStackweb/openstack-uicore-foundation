/**
 * @jest-environment node
 *
 * With no window (server rendering) every getter returns its documented
 * default, and a configured value is still honored.
 */
import {
  setConfig,
  buildAPIBaseUrl,
  getTimeServiceUrl,
  getAllowedUserGroups,
  getOAuth2ClientId,
  getOAuth2Flow,
  useOAuth2RefreshToken,
  getOAuth2IDPBaseUrl,
  getOAuth2Scopes,
  getExclusiveSections,
  getFileUploadApiBaseUrl,
} from "../config";

describe("config getters without a window", () => {
  // The jest config plants a `window` global even in the node environment;
  // the getters check `typeof window` at call time, so remove it here.
  let savedWindow;
  beforeAll(() => {
    savedWindow = global.window;
    delete global.window;
  });
  afterAll(() => {
    global.window = savedWindow;
  });
  afterEach(() => setConfig({}));

  test("there is no window in this environment", () => {
    expect(typeof window).toBe("undefined");
  });

  test("each getter returns its no-window default", () => {
    expect(buildAPIBaseUrl("/x")).toBe(null);
    expect(getTimeServiceUrl()).toBe(null);
    expect(getAllowedUserGroups()).toBe(null);
    expect(getOAuth2ClientId()).toBe(null);
    expect(getOAuth2Flow()).toBe("token id_token");
    expect(useOAuth2RefreshToken()).toBe(true);
    expect(getOAuth2IDPBaseUrl()).toBe(null);
    expect(getOAuth2Scopes()).toBe(null);
    expect(getExclusiveSections()).toBe(undefined);
    expect(getFileUploadApiBaseUrl()).toBe(null);
  });

  test("a configured value is returned without a window", () => {
    setConfig({ apiBaseUrl: "https://cfg.test", oauth2Flow: "code" });
    expect(buildAPIBaseUrl("/x")).toBe("https://cfg.test/x");
    expect(getOAuth2Flow()).toBe("code");
  });
});
