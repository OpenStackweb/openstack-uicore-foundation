
import {
    amountToCents,
    amountFromCents,
    parsePrice,
    currencyAmountFromCents,
} from "../money";

describe("amountToCents()", () => {
    test("throws if amount is null/undefined", () => {
        expect(() => amountToCents(null)).toThrow("amount is required");
        expect(() => amountToCents(undefined)).toThrow("amount is required");
    });

    test("parses simple decimals (string and number)", () => {
        expect(amountToCents("12.34")).toBe(1234);
        expect(amountToCents(12.34)).toBe(1234);
        expect(amountToCents("0")).toBe(0);
        expect(amountToCents("0.1")).toBe(10);
        expect(amountToCents("0.01")).toBe(1);
        expect(amountToCents("  12.34  ")).toBe(1234);
    });

    test("normalizes thousands separators and decimal comma", () => {
        expect(amountToCents("1,234.56")).toBe(123456); // thousands comma
        expect(amountToCents("1234,56")).toBe(123456);  // decimal comma
    });

    test("rejects invalid formats", () => {
        expect(() => amountToCents("")).toThrow(/Invalid money format/);
        expect(() => amountToCents("abc")).toThrow(/Invalid money format/);
        expect(() => amountToCents("-1.00")).toThrow(/Invalid money format/);
        expect(() => amountToCents("12.34.56")).toThrow(/Invalid money format/);
        expect(() => amountToCents("12,34,56")).toThrow(/Invalid money format/);
        expect(() => amountToCents("12a.34")).toThrow(/Invalid money format/);
    });

    describe("rounding (half-up to 2 decimals)", () => {
        test("does not round up below 0.005", () => {
            expect(amountToCents("1.004")).toBe(100);
            expect(amountToCents("0.994")).toBe(99);
        });

        test("rounds up at 0.005", () => {
            expect(amountToCents("1.005")).toBe(101);
            expect(amountToCents("0.995")).toBe(100);
        });

        test("rounds up above 0.005", () => {
            expect(amountToCents("1.006")).toBe(101);
            expect(amountToCents("0.999")).toBe(100);
        });

        test("handles more than 3 decimals (still half-up based on 3rd digit)", () => {
            expect(amountToCents("1.0051")).toBe(101);
            expect(amountToCents("1.0009")).toBe(100);
            expect(amountToCents("2.12999")).toBe(213); // 2.12 + round up => 2.13
        });
    });
});

describe("amountFromCents()", () => {
    test("converts cents to decimal string (BigInt)", () => {
        expect(amountFromCents(0)).toBe("0.00");
        expect(amountFromCents(1)).toBe("0.01");
        expect(amountFromCents(5)).toBe("0.05");
        expect(amountFromCents(30)).toBe("0.30");
        expect(amountFromCents(1234)).toBe("12.34");
        expect(amountFromCents(100)).toBe("1.00");
    });

    test("accepts number if it is a safe integer", () => {
        expect(amountFromCents(1234)).toBe("12.34");
        expect(() => amountFromCents(12.34)).toThrow(/safe integer/i);
        expect(() => amountFromCents(Number.MAX_SAFE_INTEGER + 1)).toThrow(/safe integer/i);
    });

    test("accepts numeric string (digits only)", () => {
        expect(amountFromCents("1234")).toBe("12.34");
        expect(amountFromCents("0005")).toBe("0.05");
        expect(() => amountFromCents("12.34")).toThrow(/digits only/i);
        expect(() => amountFromCents("abc")).toThrow(/digits only/i);
        expect(() => amountFromCents("")).toThrow(/digits only/i);
    });

    test("rejects negative cents", () => {
        expect(() => amountFromCents(-1)).toThrow(/non-negative/i);
        expect(() => amountFromCents(-1n)).toThrow(/non-negative/i);
    });

    test("rejects unsupported types", () => {
        expect(() => amountFromCents({})).toThrow(/bigint, number, or numeric string/i);
        expect(() => amountFromCents([])).toThrow(/bigint, number, or numeric string/i);
    });
});

describe("parsePrice()", () => {
    test("throws if priceString is null/undefined", () => {
        expect(() => parsePrice(null)).toThrow("priceString is required");
        expect(() => parsePrice(undefined)).toThrow("priceString is required");
    });

    test("rejects negatives explicitly", () => {
        expect(() => parsePrice("-$1.00")).toThrow(/Negative amounts are not allowed/);
        expect(() => parsePrice(" - 1,00 ")).toThrow(/Negative amounts are not allowed/);
    });

    test("strips currency/symbols and returns BigInt cents", () => {
        expect(parsePrice("$0.30")).toBe(30);
        expect(parsePrice("USD 1,234.56")).toBe(123456);
        expect(parsePrice("€ 12,34")).toBe(1234);
        expect(parsePrice("  ARS   0,01  ")).toBe(1);
    });

    test("throws on invalid price after stripping", () => {
        expect(() => parsePrice("$")).toThrow(/Invalid price/);
        expect(() => parsePrice("nope")).toThrow(/Invalid price/);
        expect(() => parsePrice("..,,")).toThrow(/Invalid money format/);
    });
});

describe("currencyAmountFromCents (integration, no mocks)", () => {
    it("throws if cents is not a number", () => {
        expect(() => currencyAmountFromCents("10")).toThrow("cents must be an integer number");
        expect(() => currencyAmountFromCents(null)).toThrow("cents must be an integer number");
        expect(() => currencyAmountFromCents(undefined)).toThrow("cents must be an integer number");
    });

    it("throws if cents is not an integer", () => {
        expect(() => currencyAmountFromCents(10.5)).toThrow("cents must be an integer number");
        expect(() => currencyAmountFromCents(NaN)).toThrow("cents must be an integer number");
    });

    it("formats USD by default", () => {
        expect(currencyAmountFromCents(0)).toBe("$0.00");
        expect(currencyAmountFromCents(30)).toBe("$0.30");
        expect(currencyAmountFromCents(1234)).toBe("$12.34");
    });

    it("formats a known currency code (EUR) if supported by your symbol map", () => {
        // If you haven't added EUR yet, this will likely fall back to "$".
        // Add EUR: "€" in your CURRENCY_SYMBOL map to make this pass.
        expect(currencyAmountFromCents(1234, "EUR")).toBe("€12.34");
    });

    it("formats a known currency code (GBP) if supported by your symbol map", () => {
        // Add GBP: "£" in your CURRENCY_SYMBOL map to make this pass.
        expect(currencyAmountFromCents(30, "GBP")).toBe("£0.30");
    });

    it('falls back to "$" for unknown currency codes', () => {
        expect(currencyAmountFromCents(100, "ZZZ")).toBe("$1.00");
    });

    it("handles negative cents", () => {
        expect( () => currencyAmountFromCents(-123, "USD")).toThrow("cents must be non-negative.");
    });
});
