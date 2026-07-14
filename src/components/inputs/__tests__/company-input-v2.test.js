/**
 * @jest-environment jsdom
 *
 * Copyright 2025 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

import CompanyInputV2, {
    isCompanyObject,
    isExistingCompany,
    isNewCompany,
    findExistingByName,
    normalizeCompanyValue
} from "../company-input-v2";

// Mock the API helper so tests can drive the callback synchronously.
jest.mock("../../../utils/query-actions", () => ({
    queryRegistrationCompanies: jest.fn()
}));
// eslint-disable-next-line import/first
import { queryRegistrationCompanies } from "../../../utils/query-actions";

describe("isCompanyObject", () => {
    it("returns true for objects with a name string", () => {
        expect(isCompanyObject({ name: "Tipit" })).toBe(true);
        expect(isCompanyObject({ id: 5, name: "Tipit" })).toBe(true);
        expect(isCompanyObject({ id: 0, name: "" })).toBe(true);
    });

    it("returns false for non-objects or objects missing a name string", () => {
        expect(isCompanyObject(null)).toBe(false);
        expect(isCompanyObject(undefined)).toBe(false);
        expect(isCompanyObject("Tipit")).toBe(false);
        expect(isCompanyObject(5)).toBe(false);
        expect(isCompanyObject({})).toBe(false);
        expect(isCompanyObject({ name: 5 })).toBe(false);
        expect(isCompanyObject({ name: null })).toBe(false);
    });
});

describe("isExistingCompany", () => {
    it("returns true when the object has a positive id and name string", () => {
        expect(isExistingCompany({ id: 1, name: "Tipit" })).toBe(true);
        expect(isExistingCompany({ id: 999, name: "Tipco" })).toBe(true);
    });

    it("returns false for free-text entries (id === 0)", () => {
        expect(isExistingCompany({ id: 0, name: "Acme" })).toBe(false);
    });

    it("returns false for non-objects, missing/zero id, or missing name", () => {
        expect(isExistingCompany(null)).toBe(false);
        expect(isExistingCompany({ name: "Tipit" })).toBe(false); // no id
        expect(isExistingCompany({ id: -1, name: "Tipit" })).toBe(false);
        expect(isExistingCompany({ id: 5 })).toBe(false); // no name
    });
});

describe("isNewCompany", () => {
    it("returns true for free-text entries with a non-empty name", () => {
        expect(isNewCompany({ id: 0, name: "Acme" })).toBe(true);
        expect(isNewCompany({ id: 0, name: "  Acme  " })).toBe(true);
    });

    it("returns false for existing companies (id > 0)", () => {
        expect(isNewCompany({ id: 1, name: "Tipit" })).toBe(false);
    });

    it("returns false for empty or whitespace-only names", () => {
        expect(isNewCompany({ id: 0, name: "" })).toBe(false);
        expect(isNewCompany({ id: 0, name: "   " })).toBe(false);
    });

    it("returns false for non-objects or missing name", () => {
        expect(isNewCompany(null)).toBe(false);
        expect(isNewCompany({ id: 0 })).toBe(false);
        expect(isNewCompany("Acme")).toBe(false);
    });
});

describe("findExistingByName", () => {
    const existing = [
        { id: 1, name: "Tipit" },
        { id: 2, name: "Tipco" },
        { id: 3, name: "ACME Corp" }
    ];

    it("returns the matching existing company when name matches case-insensitively", () => {
        expect(findExistingByName(existing, "tipit")).toEqual({ id: 1, name: "Tipit" });
        expect(findExistingByName(existing, "TIPCO")).toEqual({ id: 2, name: "Tipco" });
        expect(findExistingByName(existing, "  acme corp  ")).toEqual({ id: 3, name: "ACME Corp" });
    });

    it("returns null when no existing company matches", () => {
        expect(findExistingByName(existing, "Nonexistent")).toBeNull();
    });

    it("returns null for empty/missing inputs", () => {
        expect(findExistingByName(existing, "")).toBeNull();
        expect(findExistingByName(existing, "   ")).toBeNull();
        expect(findExistingByName(existing, undefined)).toBeNull();
        expect(findExistingByName(null, "Tipit")).toBeNull();
    });

    it("ignores free-text entries (id === 0) when searching", () => {
        const mixed = [
            { id: 0, name: "tipit" },          // free-text entry
            { id: 1, name: "Tipit" }            // real company
        ];
        // Should pick the real one even though the free-text comes first
        expect(findExistingByName(mixed, "tipit")).toEqual({ id: 1, name: "Tipit" });
    });

    it("returns null when only free-text entries are present", () => {
        const freeTextOnly = [{ id: 0, name: "Acme" }];
        expect(findExistingByName(freeTextOnly, "Acme")).toBeNull();
    });
});

describe("normalizeCompanyValue", () => {
    it("returns the value unchanged when it has a real name", () => {
        const v = { id: 1, name: "Tipit" };
        expect(normalizeCompanyValue(v)).toBe(v);
        expect(normalizeCompanyValue("Tipit")).toBe("Tipit");
    });

    it("returns null for null/undefined", () => {
        expect(normalizeCompanyValue(null)).toBeNull();
        expect(normalizeCompanyValue(undefined)).toBeNull();
    });

    it("returns null for empty strings", () => {
        expect(normalizeCompanyValue("")).toBeNull();
        expect(normalizeCompanyValue("   ")).toBeNull();
    });

    it("returns null for objects with no name or empty name", () => {
        expect(normalizeCompanyValue({})).toBeNull();
        expect(normalizeCompanyValue({ id: 5 })).toBeNull();
        expect(normalizeCompanyValue({ id: 0, name: "" })).toBeNull();
        expect(normalizeCompanyValue({ id: 0, name: "   " })).toBeNull();
    });
});

describe("CompanyInputV2 integration", () => {
    beforeEach(() => {
        queryRegistrationCompanies.mockReset();
    });

    // Helper: render the component inside a controlled wrapper so we can react
    // to onChange the same way a real form would (updating `value`).
    const renderControlled = ({ initialValue = null, onChange } = {}) => {
        let setValue;
        const Wrapper = () => {
            const [value, _setValue] = React.useState(initialValue);
            setValue = _setValue;
            return (
                <CompanyInputV2
                    summitId={1}
                    name="company"
                    value={value}
                    onChange={(ev) => {
                        if (onChange) onChange(ev);
                        // Mirror what a real form does: write the value back.
                        _setValue(ev.target.value);
                    }}
                />
            );
        };
        const utils = render(<Wrapper />);
        return { ...utils, getValue: () => setValue };
    };

    it("on blur takes the typed text and, when it matches no option, commits it as free text (never a highlighted option)", () => {
        // The bug this guards: with autoSelect, mousing over a suggestion and
        // tabbing away committed that highlighted company. Now blur must commit
        // exactly what was typed.
        let resolveQuery;
        queryRegistrationCompanies.mockImplementation((_summitId, _input, cb) => {
            resolveQuery = cb;
        });

        const onChange = jest.fn();
        renderControlled({ onChange });
        const input = screen.getByRole("combobox");

        // Type "Tip"; two suggestions come back (either could get highlighted on hover).
        fireEvent.change(input, { target: { value: "Tip" } });
        act(() => { resolveQuery([{ id: 1, name: "Tipit" }, { id: 2, name: "Tipco" }]); });

        // Tab away without picking anything.
        fireEvent.blur(input);

        const committed = onChange.mock.calls.map((c) => c[0].target.value).pop();
        // Exactly what was typed, as a free-text entry — not id 1 or id 2.
        expect(committed).toEqual({ id: 0, name: "Tip" });
    });

    it("commits a browser-autofilled value on blur even when it never fired onInputChange (#241 iOS Chrome)", () => {
        // Autofill writes straight to the DOM without React's onInputChange, so
        // the component's input state stays empty. The blur handler must read
        // the DOM value (event.target.value), not React state, or required-field
        // validation regresses — the exact bug #241's autoSelect fixed.
        queryRegistrationCompanies.mockImplementation(() => {});

        const onChange = jest.fn();
        renderControlled({ onChange });
        const input = screen.getByRole("combobox");

        // Simulate autofill: set the DOM value directly (no fireEvent.change ->
        // no onInputChange), then blur.
        input.value = "Autofilled Co";
        fireEvent.blur(input);

        const committed = onChange.mock.calls.map((c) => c[0].target.value).pop();
        expect(committed).toEqual({ id: 0, name: "Autofilled Co" });
    });

    it("clears the committed company when the field is emptied (delete-all-text) and blurred", () => {
        // With disableClearable there's no (x), so deleting the text and blurring
        // is the only way to clear — the value must propagate as null.
        queryRegistrationCompanies.mockImplementation(() => {});

        const onChange = jest.fn();
        renderControlled({ initialValue: { id: 1, name: "Tipit" }, onChange });
        const input = screen.getByRole("combobox");

        fireEvent.change(input, { target: { value: "" } });
        fireEvent.blur(input);

        const committed = onChange.mock.calls.map((c) => c[0].target.value).pop();
        expect(committed).toBeNull();
    });

    it("does not fire a redundant change when an already-empty field is blurred", () => {
        queryRegistrationCompanies.mockImplementation(() => {});

        const onChange = jest.fn();
        renderControlled({ initialValue: null, onChange });
        const input = screen.getByRole("combobox");

        fireEvent.blur(input);

        expect(onChange).not.toHaveBeenCalled();
    });

    it("on blur commits the canonical existing match when the typed text matches case-insensitively", () => {
        // Capture the API callback so we can resolve it manually.
        let resolveQuery;
        queryRegistrationCompanies.mockImplementation((_summitId, _input, cb) => {
            resolveQuery = cb;
        });

        const onChange = jest.fn();
        renderControlled({ onChange });
        const input = screen.getByRole("combobox");

        // Type "tipit": triggers onInputChange -> effect -> queryRegistrationCompanies
        fireEvent.change(input, { target: { value: "tipit" } });
        // Resolve the API with the canonical company.
        act(() => { resolveQuery([{ id: 1, name: "Tipit" }]); });

        // Blur: autoSelect commits the typed string; our onChange handler maps
        // it to the canonical option via findExistingByName.
        fireEvent.blur(input);

        // Find the call where the canonical value landed.
        const committed = onChange.mock.calls
            .map((c) => c[0].target.value)
            .find((v) => v && typeof v === "object" && v.id === 1);
        expect(committed).toEqual({ id: 1, name: "Tipit" });
    });

    it("auto-replaces a free-text commit with the canonical match when the API response arrives after blur", () => {
        // Withhold the API callback so we control when the response "arrives".
        queryRegistrationCompanies.mockImplementation(() => {});

        const onChange = jest.fn();
        renderControlled({ onChange });
        const input = screen.getByRole("combobox");

        // Type "tipit": fires onInputChange, populates inputValue, triggers the effect.
        fireEvent.change(input, { target: { value: "tipit" } });

        // Blur: autoSelect commits the typed string as free-text { id: 0, name: "tipit" }
        // via the wrapper's onChange handler, which writes it back to value. The
        // value change re-runs the effect with the new normalizedValue closure.
        fireEvent.blur(input);
        onChange.mockClear();

        // Pull the API callback from the most recent effect run (the one with
        // the post-blur normalizedValue captured in its closure).
        expect(queryRegistrationCompanies).toHaveBeenCalled();
        const [, , cb] = queryRegistrationCompanies.mock.calls[queryRegistrationCompanies.mock.calls.length - 1];

        // Now the API response arrives with the canonical option. The effect
        // sees the active value is a free-text match and auto-replaces it.
        act(() => { cb([{ id: 1, name: "Tipit" }]); });

        const promoted = onChange.mock.calls
            .map((c) => c[0].target.value)
            .find((v) => v && typeof v === "object" && v.id === 1);
        expect(promoted).toEqual({ id: 1, name: "Tipit" });
    });

    it("does not render the clear icon when the value is an empty-name object", () => {
        queryRegistrationCompanies.mockImplementation(() => {});
        render(
            <CompanyInputV2
                summitId={1}
                name="company"
                value={{ id: 0, name: "" }}
                onChange={() => {}}
            />
        );
        // MUI's clear button uses aria-label="Clear".
        expect(screen.queryByLabelText("Clear")).not.toBeInTheDocument();
    });

    it("never renders the clear icon, even with a real selected company (disableClearable)", () => {
        queryRegistrationCompanies.mockImplementation(() => {});
        render(
            <CompanyInputV2
                summitId={1}
                name="company"
                value={{ id: 1, name: "Tipit" }}
                onChange={() => {}}
            />
        );
        expect(screen.queryByLabelText("Clear")).not.toBeInTheDocument();
    });

    it("offers a 'Use \"<typed>\"' option that commits the typed text as a free-text entry", () => {
        let resolveQuery;
        queryRegistrationCompanies.mockImplementation((_summitId, _input, cb) => {
            resolveQuery = cb;
        });

        const onChange = jest.fn();
        renderControlled({ onChange });
        const input = screen.getByRole("combobox");

        // Type a name with no existing match; the listbox opens with just the
        // synthetic "Use ..." row.
        fireEvent.change(input, { target: { value: "Acme" } });
        act(() => { resolveQuery([]); });

        const useOption = screen.getByText('Use "Acme"');
        fireEvent.click(useOption);

        const committed = onChange.mock.calls
            .map((c) => c[0].target.value)
            .find((v) => v && typeof v === "object" && v.id === 0);
        // Committed clean, without the display-only marker.
        expect(committed).toEqual({ id: 0, name: "Acme" });
    });

    it("does not offer the 'Use' row when the typed text already matches an option", () => {
        let resolveQuery;
        queryRegistrationCompanies.mockImplementation((_summitId, _input, cb) => {
            resolveQuery = cb;
        });

        renderControlled({});
        const input = screen.getByRole("combobox");

        fireEvent.change(input, { target: { value: "Tipit" } });
        act(() => { resolveQuery([{ id: 1, name: "Tipit" }]); });

        // The real company shows; no redundant "Use "Tipit"" row.
        expect(screen.queryByText('Use "Tipit"')).not.toBeInTheDocument();
    });
});
