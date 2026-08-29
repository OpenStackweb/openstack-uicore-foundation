/**
 * getUserInfo reads the access token through security/methods.getAccessToken,
 * so a registered resolver must be what the /members/me request sends.
 * The request pipeline (utils/actions) is mocked; the token path is real.
 */
jest.mock("../../../utils/actions", () => ({
  getRequest: jest.fn(),
  createAction: jest.fn((t) => ({ type: t })),
  authErrorHandler: jest.fn(),
  showMessage: jest.fn(() => () => {}),
  startLoading: jest.fn(() => ({ type: "START_LOADING" })),
  stopLoading: jest.fn(() => ({ type: "STOP_LOADING" })),
}));
jest.mock("../../../utils/methods", () => ({
  buildAPIBaseUrl: jest.fn((p) => `BASE${p}`),
  getAllowedUserGroups: jest.fn(() => ""),
}));

import { getUserInfo } from "../actions";
import { setAccessTokenResolver } from "../methods";
import { getRequest } from "../../../utils/actions";

describe("getUserInfo with an access-token resolver", () => {
  afterEach(() => {
    setAccessTokenResolver(null);
    jest.clearAllMocks();
  });

  test("sends the resolver's token to /members/me", async () => {
    const resolver = jest.fn(() => Promise.resolve("RES-TOK"));
    setAccessTokenResolver(resolver);
    const withParams = jest.fn(() => jest.fn(() => Promise.resolve()));
    getRequest.mockReturnValue(withParams);
    const dispatch = jest.fn();
    const getState = jest.fn(() => ({ loggedUserState: { member: null } }));

    await getUserInfo("groups", "", null, null, null)(dispatch, getState);

    expect(resolver).toHaveBeenCalled();
    expect(getRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "BASE/api/v1/members/me",
      expect.anything()
    );
    expect(withParams).toHaveBeenCalledWith(
      expect.objectContaining({ access_token: "RES-TOK", expand: "groups" })
    );
  });
});
