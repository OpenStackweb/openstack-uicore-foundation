import en from "../en.json";
import zh from "../zh.json";

const loadI18n = async (language) => {
  jest.resetModules();
  jest.doMock("../../utils/methods", () => ({
    getCurrentUserLanguage: () => language
  }));
  const T = (await import("i18n-react")).default;
  const i18n = await import("../i18n");
  return { T, ...i18n };
};

describe("i18n lib translations", () => {
  afterEach(() => {
    jest.dontMock("../../utils/methods");
  });

  it("uses the matching bundle when the key is translated", async () => {
    const { T } = await loadI18n("zh-CN");
    expect(T.translate("general.save")).toBe(zh.general.save);
  });

  it("falls back to English for keys missing from a partial bundle", async () => {
    const { T } = await loadI18n("zh-CN");
    // zh.json only translates errors/general, so this would otherwise render
    // the raw key
    expect(T.translate("sponsor_order_grid.code")).toBe(
      en.sponsor_order_grid.code
    );
  });

  it("falls back to English for unsupported languages", async () => {
    const { T } = await loadI18n("fr-FR");
    expect(T.translate("general.save")).toBe(en.general.save);
    expect(T.translate("sponsor_order_grid.code")).toBe(
      en.sponsor_order_grid.code
    );
  });

  it("lets consumer texts win but keeps the lib fallbacks in setAppTexts", async () => {
    const { T, setAppTexts } = await loadI18n("zh-CN");
    setAppTexts({ sponsor_order_grid: { code: "Custom Code" } });
    expect(T.translate("sponsor_order_grid.code")).toBe("Custom Code");
    expect(T.translate("sponsor_order_grid.type")).toBe(
      en.sponsor_order_grid.type
    );
    expect(T.translate("general.save")).toBe(zh.general.save);
  });
});
