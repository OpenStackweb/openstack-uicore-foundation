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
 * */

/**
 * Uses the REAL @dnd-kit/utilities so CSS.Transform.toString runs for real.
 * Only useSortable is stubbed, to force the isDragging-with-no-transform-yet
 * state that occurs the instant a drag starts, before dnd-kit has measured
 * a transform.
 */
jest.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: true
  })
}));

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import SortableRow from "../sortable-table-v2/sortable-row";

test("emits no literal 'undefined' transform when dragging starts before a transform is measured", () => {
  render(
    <table>
      <tbody>
        <SortableRow id="1">{() => <td>content</td>}</SortableRow>
      </tbody>
    </table>
  );

  const styleTag = document.querySelector('style[data-emotion="css"]');
  const css = Array.from(styleTag.sheet.cssRules)
    .map((rule) => rule.cssText)
    .join("\n");

  expect(css).not.toMatch(/transform:\s*undefined/);
});
