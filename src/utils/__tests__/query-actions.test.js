/**
 * query-actions reads the access token through security/methods.getAccessToken,
 * so a registered resolver must be what every query* function sends.
 *
 * lodash/debounce is mocked to a passthrough so the query* functions run
 * synchronously; the debounce delay is unrelated to the token path.
 */
import { setAccessTokenResolver } from "../../components/security/methods";
import * as queryActions from "../query-actions";
const { queryMembers, querySummits, queryRegistrationCompanies } = queryActions;

jest.mock("lodash/debounce", () => (fn) => fn);

const flush = async () => {
  for (let i = 0; i < 6; i++) await new Promise((r) => setTimeout(r, 0));
};

describe("query-actions with an access-token resolver", () => {
  let origFetch;

  beforeEach(() => {
    window.API_BASE_URL = "https://api.test";
    origFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [{ id: 1 }] }) })
    );
  });

  afterEach(() => {
    setAccessTokenResolver(null);
    global.fetch = origFetch;
    jest.clearAllMocks();
  });

  test("sends the resolver's token as access_token", async () => {
    const resolver = jest.fn(() => Promise.resolve("RES-TOK"));
    setAccessTokenResolver(resolver);
    const cb = jest.fn();

    queryMembers("x", cb);
    await flush();

    expect(resolver).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const url = decodeURIComponent(global.fetch.mock.calls[0][0]);
    expect(url).toContain("https://api.test/api/v1/members");
    expect(url).toContain("access_token=RES-TOK");
    expect(cb).toHaveBeenCalledWith([{ id: 1 }]);
  });

  test("a resolver failure calls back with the error and does not fetch", async () => {
    setAccessTokenResolver(() => Promise.reject(new Error("no session")));
    const cb = jest.fn();

    querySummits("x", cb);
    await flush();

    expect(cb).toHaveBeenCalledWith(expect.any(Error));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("query-actions public surface and URL building", () => {
  let origFetch;

  beforeEach(() => {
    window.API_BASE_URL = "https://api.test";
    origFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [{ id: 1, name: "Acme" }] }) })
    );
    setAccessTokenResolver(() => Promise.resolve("TOK"));
  });

  afterEach(() => {
    setAccessTokenResolver(null);
    global.fetch = origFetch;
    delete window.API_BASE_URL;
    jest.clearAllMocks();
  });

  test("every named export is present", () => {
    [
      "queryMembers", "queryAttendees", "querySummits", "querySpeakers", "queryTags",
      "queryTracks", "queryTrackGroups", "queryEvents", "queryEventTypes", "queryGroups",
      "queryCompanies", "queryRegistrationCompanies", "querySponsors",
      "querySponsorsWithBadgeScans", "queryAccessLevels", "queryOrganizations",
      "queryTicketTypes", "querySponsoredProjects", "queryPromocodes",
      "getCountryList", "getLanguageList", "geoCodeAddress", "geoCodeLatLng",
    ].forEach((name) => expect(typeof queryActions[name]).toBe("function"));
    expect(queryActions.RECEIVE_COUNTRIES).toBe("RECEIVE_COUNTRIES");
    expect(queryActions.DEFAULT_PAGE_SIZE).toBe(10);
  });

  test("builds the URL on window.API_BASE_URL with the filter and paging params", async () => {
    const cb = jest.fn();
    queryRegistrationCompanies(13, "acme", cb);
    await flush();

    const url = decodeURIComponent(global.fetch.mock.calls[0][0]);
    expect(url).toContain("https://api.test/api/v1/summits/13/registration-companies");
    expect(url).toContain("order=name");
    expect(url).toContain("per_page=10");
    expect(url).toContain("name@@acme");
    expect(cb).toHaveBeenCalledWith([{ id: 1, name: "Acme" }]);
  });

  test("a 404 response calls back with []", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const cb = jest.fn();
    queryMembers("x", cb);
    await flush();
    expect(cb).toHaveBeenCalledWith([]);
  });
});
