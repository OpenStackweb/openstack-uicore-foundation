/**
 * query-actions reads the access token through security/methods.getAccessToken,
 * so a registered resolver must be what every query* function sends.
 *
 * lodash/debounce is mocked to a passthrough so the query* functions run
 * synchronously; the debounce delay is unrelated to the token path.
 */
import { setAccessTokenResolver } from "../../components/security/methods";
import { queryMembers, querySummits } from "../query-actions";

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
