/**
 * Copyright 2025 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import {
    isCompanyObject,
    isExistingCompany,
    findExistingByName,
    normalizeCompanyValue
} from "../company-input-v2";

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
