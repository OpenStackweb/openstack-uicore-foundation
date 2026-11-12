/**
 * Copyright 2026 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// Smoke tests that run the real react-select, one per usage pattern in uicore's inputs
// (plain Select, Async with callback loadOptions, AsyncCreatable, Creatable, custom components).

jest.mock("../../../utils/query-actions", () => ({
  querySpeakers: jest.fn((summitId, input, callback) =>
    callback([{ id: 7, first_name: "Ada", last_name: "Lovelace" }])
  )
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Dropdown from "../dropdown";
import SponsorInput from "../sponsor-input";
import CompanyInput from "../company-input";
import FreeMultiTextInput from "../free-multi-text-input";
import SpeakerInput from "../speaker-input";

const OPTIONS = [
  { value: 1, label: "One" },
  { value: 2, label: "Two" }
];

const lastTarget = (onChange) => onChange.mock.calls.at(-1)[0].target;

describe("react-select based inputs", () => {
  test("Dropdown emits the picked option's value", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(<Dropdown id="ddl" options={OPTIONS} value={null} onChange={onChange} />);

    await user.click(container.querySelector("input"));
    await user.click(await screen.findByText("Two"));

    expect(lastTarget(onChange)).toEqual({ id: "ddl", value: 2, type: "dropdown" });
  });

  test("Dropdown with isMulti emits the array of values", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <Dropdown id="ddl" options={OPTIONS} value={[1]} isMulti onChange={onChange} />
    );

    expect(screen.getByText("One")).toBeInTheDocument();
    await user.click(container.querySelector("input"));
    await user.click(await screen.findByText("Two"));

    expect(lastTarget(onChange).value).toEqual([1, 2]);
  });

  test("SponsorInput loads options through a callback-style loadOptions", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const sponsor = { id: 3, company: { name: "Acme" }, sponsorship: { type: { name: "Gold" } } };
    const queryFunction = jest.fn((summitId, input, callback) => callback([sponsor]));
    const { container } = render(
      <SponsorInput id="sponsor" summitId={1} value={null} error="" onChange={onChange} queryFunction={queryFunction} />
    );

    await user.type(container.querySelector("input"), "ac");
    await user.click(await screen.findByText("Acme (Gold)"));

    expect(queryFunction).toHaveBeenCalledWith(1, expect.any(String), expect.any(Function));
    expect(lastTarget(onChange)).toEqual({ id: "sponsor", value: sponsor, type: "sponsorinput" });
  });

  test("CompanyInput with allowCreate creates a new company", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onCreate = jest.fn((name, done) => done({ id: 9, name }));
    const queryFunction = jest.fn((input, callback) => callback([]));
    const { container } = render(
      <CompanyInput id="company" value={null} onChange={onChange} onCreate={onCreate} queryFunction={queryFunction} allowCreate />
    );

    await user.type(container.querySelector("input"), "Initech");
    await user.click(await screen.findByText('Create "Initech"'));

    expect(onCreate).toHaveBeenCalledWith("Initech", expect.any(Function));
    expect(lastTarget(onChange)).toEqual({ id: "company", value: { id: 9, name: "Initech" }, type: "companyinput" });
  });

  test("FreeMultiTextInput adds typed text on Enter", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(<FreeMultiTextInput id="tags" value={[]} onChange={onChange} />);

    await user.type(container.querySelector("input"), "first{Enter}");

    const target = lastTarget(onChange);
    expect(target.id).toBe("tags");
    expect(target.type).toBe("freetextlist");
    // Creatable may tag the new option with __isNew__; only the text matters here
    expect(target.value).toEqual([expect.objectContaining({ label: "first", value: "first" })]);
  });

  test("SpeakerInput renders the custom multi-value label that links to the speaker", async () => {
    const user = userEvent.setup();
    const history = { push: jest.fn() };
    render(
      <SpeakerInput
        id="speakers"
        multi
        history={history}
        value={[{ id: 7, first_name: "Ada", last_name: "Lovelace" }]}
        onChange={jest.fn()}
      />
    );

    await user.click(screen.getByText("Ada Lovelace (7)"));

    expect(history.push).toHaveBeenCalledWith("/app/speakers/7");
  });
});
