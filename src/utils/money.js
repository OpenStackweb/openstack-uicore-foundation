/**
 * Copyright 2025 OpenStack Foundation
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

import {
    CENTS_FACTOR,
    THREE_DECIMAL_PLACES,
    TWO_DECIMAL_PLACES,
    ZERO_INT,
    ONE_CENT
} from "./constants";

/**
 * Convert a decimal money amount to integer cents safely (no floating point math).
 *
 * Why this exists:
 * - `Math.round(parseFloat(x) * 100)` can be wrong due to IEEE-754 floating point errors
 *   (e.g. 1.005 * 100 may become 100.499999..., rounding down unexpectedly).
 *
 * Input:
 * - number or string (recommended: string from API/UI)
 * - Examples: "12.34", "1,234.56", "1234,56", 12.34
 *
 * Output:
 * - Number cents (exact), e.g. "12.34" -> 1234
 *
 * Rounding:
 * - Half-up to 2 decimals (>= 0.005 USD rounds up by 1 cent).
 *
 * Notes:
 * - Amounts are assumed to be NON-negative (per your requirement).
 * - Throws on invalid formats (does not silently return 0).
 */
export function amountToCents(amount) {
    if (amount == null) throw new Error("amount is required");

    let s = String(amount).trim();

    // Normalize common separators:
    // - "1,234.56" => "1234.56" (remove thousands separators)
    // - "1234,56"  => "1234.56" (convert decimal comma to dot)
    if (s.includes(",") && s.includes(".")) {
        s = s.replace(/,/g, "");
    } else if (s.includes(",") && !s.includes(".")) {
        s = s.replace(",", ".");
    }

    // Validate: digits optionally followed by '.' and more digits
    if (!/^\d+(\.\d+)?$/.test(s)) {
        throw new Error(`Invalid money format: "${amount}"`);
    }

    const [intPart, fracRaw = ""] = s.split(".");

    // Pad at least 3 fractional digits so we can:
    // - take 2 digits for cents
    // - take the 3rd digit to decide rounding
    const fracPadded = (`${fracRaw  }000`);

    const tenths = fracPadded[0] ?? "0";      // 1st decimal digit
    const hundredths = fracPadded[1] ?? "0";  // 2nd decimal digit (cents)
    const thousandths = fracPadded[2] ?? "0"; // 3rd decimal digit (rounding decision)

    // If there are more than 3 decimals, we track if any non-zero exists after the 3rd.
    // This can matter for policies like bankers rounding; here it's mainly informational.
    const trailing =
        fracRaw.length > THREE_DECIMAL_PLACES
            ? fracRaw.slice(THREE_DECIMAL_PLACES)
            : "";
    const hasTrailingNonZero = /[1-9]/.test(trailing);

    // Build cents as integer: (dollars * 100) + (first two decimal digits)
    let cents = BigInt(intPart) * CENTS_FACTOR + BigInt(tenths + hundredths);

    // Half-up rounding:
    // - If the 3rd digit is >= 5, round up by 1 cent.
    // - If there are more digits beyond the 3rd, "5xxx" should also round up.
    const roundUp = thousandths > "5" || thousandths === "5" || (thousandths === "5" && hasTrailingNonZero);

    if (roundUp) cents += ONE_CENT;

    return Number(cents);
}

/**
 * Convert an amount in cents to a decimal string (e.g. 1234 -> "12.34") safely.
 *
 * Why:
 * - Avoids floating point math (cents / 100) which can lose precision for large integers
 *   or if cents is already imprecise as a JS Number.
 *
 * Input:
 * - Accepts: bigint | number | string (digits)
 * - Assumes NON-negative cents (per your requirement).
 *
 * Output:
 * - Always returns a string with exactly 2 decimal places.
 */
export function amountFromCents(cents) {
    let c;

    // Normalize input to BigInt safely
    if (typeof cents === "bigint") {
        c = cents;
    } else if (typeof cents === "number") {
        // Ensure it's a safe integer before converting to BigInt
        if (!Number.isSafeInteger(cents)) {
            throw new Error("cents must be a safe integer Number (or pass BigInt/string).");
        }
        c = BigInt(cents);
    } else if (typeof cents === "string") {
        const s = cents.trim();
        if (!/^\d+$/.test(s)) {
            throw new Error("cents string must contain digits only (e.g., '1234').");
        }
        c = BigInt(s);
    } else {
        throw new Error("cents must be a bigint, number, or numeric string.");
    }

    if (c < ZERO_INT) {
        throw new Error("cents must be non-negative.");
    }

    const dollars = c / CENTS_FACTOR;
    const remainder = c % CENTS_FACTOR;

    // Always pad remainder to 2 digits
    return `${dollars.toString()}.${remainder.toString().padStart(TWO_DECIMAL_PLACES, "0")}`;
}

/**
 * Converts a price string into cents.
 * @param {string} priceString - The price (e.g., $0.30).
 * @returns {number} - The amount converted to cents (e.g., 30).
 */
export const parsePrice = (priceString) => {
    if (priceString == null) throw new Error("priceString is required");

    let s = String(priceString).trim();

    // Reject negatives explicitly (per your requirement).
    if (s.includes("-")) throw new Error("Negative amounts are not allowed");

    // Keep only digits and separators. Remove currency symbols/letters/spaces.
    s = s.replace(/[^\d.,]/g, "");
    if (!s) throw new Error(`Invalid price: "${priceString}"`);

    // Delegate exact cents conversion (no floats)
    return amountToCents(s); // <- your safe BigInt cents converter
};
