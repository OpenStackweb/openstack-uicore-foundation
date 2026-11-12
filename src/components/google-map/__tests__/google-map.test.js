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

// The real map needs Google's script, so vis.gl and the clusterer are replaced by
// thin fakes that expose the callbacks GMap wires up.
const mockMap = {
  setZoom: jest.fn(),
  setCenter: jest.fn(),
  fitBounds: jest.fn(),
  getBounds: jest.fn()
};
const mockMapProps = {};
const mockMarkerProps = {};

jest.mock("@vis.gl/react-google-maps", () => {
  const React = require("react");
  return {
    APIProvider: ({ children }) => <>{children}</>,
    useMap: () => mockMap,
    Map: (props) => {
      Object.assign(mockMapProps, props);
      return <div data-testid="map">{props.children}</div>;
    },
    Marker: React.forwardRef((props, ref) => {
      const instance = React.useRef({ markerAt: props.position });
      React.useImperativeHandle(ref, () => instance.current, []);
      mockMarkerProps[`${props.position.lat},${props.position.lng}`] = props;
      return (
        <button type="button" onClick={props.onClick}>
          marker {props.position.lat},{props.position.lng}
        </button>
      );
    }),
    InfoWindow: ({ children, onCloseClick }) => (
      <div role="dialog">
        {children}
        <button type="button" onClick={onCloseClick}>close</button>
      </div>
    )
  };
});

const mockClusterer = { addMarkers: jest.fn(), clearMarkers: jest.fn() };
jest.mock("@googlemaps/markerclusterer", () => ({
  MarkerClusterer: jest.fn(() => mockClusterer),
  GridAlgorithm: jest.fn((options) => ({ options }))
}));

import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { GridAlgorithm, MarkerClusterer } from "@googlemaps/markerclusterer";
import GMap from "../index";

class LatLng {
  constructor(lat, lng) {
    this.latValue = lat;
    this.lngValue = lng;
  }
  lat() { return this.latValue; }
  lng() { return this.lngValue; }
}

class LatLngBounds {
  constructor() { this.points = []; }
  extend(point) { this.points.push(point); }
}

const installGoogle = () => {
  window.google = { maps: { importLibrary: jest.fn(), LatLng, LatLngBounds } };
};

const markerA = { id: 1, lat: 10, lng: 20, name: "Hall A" };
const markerB = { id: 2, lat: 11, lng: 21, name: "Hall B" };

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(mockMapProps).forEach((k) => delete mockMapProps[k]);
  Object.keys(mockMarkerProps).forEach((k) => delete mockMarkerProps[k]);
  installGoogle();
});

afterEach(() => {
  delete window.google;
});

describe("GMap", () => {
  test("waits for the app's Maps script before mounting the map", () => {
    jest.useFakeTimers();
    delete window.google;

    render(<GMap markers={[markerA]} center={{ lat: 10, lng: 20 }} />);
    expect(screen.queryByTestId("map")).not.toBeInTheDocument();

    installGoogle();
    act(() => { jest.advanceTimersByTime(100); });

    expect(screen.getByTestId("map")).toBeInTheDocument();
    jest.useRealTimers();
  });

  test("uses the default zoom and center when none are given", () => {
    render(<GMap markers={[]} center={{}} />);
    expect(mockMap.setZoom).toHaveBeenCalledWith(2);
    expect(mockMap.setCenter).toHaveBeenCalledWith({ lat: 30.270166, lng: -97.731271 });
  });

  test("applies the given zoom and center", () => {
    render(<GMap markers={[markerA]} center={{ lat: 10, lng: 20 }} zoom={16} />);
    expect(mockMapProps.defaultZoom).toBe(16);
    expect(mockMap.setZoom).toHaveBeenCalledWith(16);
    expect(mockMap.setCenter).toHaveBeenCalledWith({ lat: 10, lng: 20 });
  });

  test("toggles a marker's info window with its name", async () => {
    const user = userEvent.setup();
    render(<GMap markers={[markerA]} center={{ lat: 10, lng: 20 }} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByText("marker 10,20"));
    expect(screen.getByRole("dialog")).toHaveTextContent("Hall A");

    await user.click(screen.getByText("close"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("opens info windows that come pre-opened in the markers", () => {
    render(<GMap markers={[{ ...markerA, isInfoWindowOpen: true }]} center={{ lat: 10, lng: 20 }} />);
    expect(screen.getByRole("dialog")).toHaveTextContent("Hall A");
  });

  test("makes markers draggable only when the draggable prop is present", () => {
    const { unmount } = render(<GMap markers={[markerA]} center={{ lat: 10, lng: 20 }} />);
    expect(mockMarkerProps["10,20"].draggable).toBe(false);
    unmount();

    render(<GMap markers={[markerA]} center={{ lat: 10, lng: 20 }} draggable />);
    expect(mockMarkerProps["10,20"].draggable).toBe(true);
  });

  test("reports the dropped position of a dragged marker", () => {
    const onMarkerDragged = jest.fn();
    render(<GMap markers={[markerA]} center={{ lat: 10, lng: 20 }} draggable onMarkerDragged={onMarkerDragged} />);

    mockMarkerProps["10,20"].onDragEnd({ latLng: new LatLng(12.5, 22.5) });

    expect(onMarkerDragged).toHaveBeenCalledWith(12.5, 22.5);
  });

  test("reports the clicked position on the map", () => {
    const onMapClick = jest.fn();
    render(<GMap markers={[]} center={{ lat: 10, lng: 20 }} onMapClick={onMapClick} />);

    mockMapProps.onClick({ detail: { latLng: { lat: 1.5, lng: 2.5 } } });

    expect(onMapClick).toHaveBeenCalledWith(1.5, 2.5);
  });

  test("reports the markers inside the visible bounds", () => {
    const onChangeCallback = jest.fn();
    render(<GMap markers={[markerA, markerB]} center={{ lat: 10, lng: 20 }} onChangeCallback={onChangeCallback} />);

    const bounds = { contains: (point) => point.lat() === 10 };
    mockMapProps.onBoundsChanged({ map: { getBounds: () => bounds } });

    expect(onChangeCallback).toHaveBeenCalledWith([markerA]);
  });

  test("fits the map to the markers when a different set of several arrives", () => {
    const { rerender } = render(<GMap markers={[markerA, markerB]} center={{ lat: 10, lng: 20 }} />);
    expect(mockMap.fitBounds).not.toHaveBeenCalled();

    const markerC = { id: 3, lat: 12, lng: 22, name: "Hall C" };
    rerender(<GMap markers={[markerA, markerC]} center={{ lat: 10, lng: 20 }} />);

    expect(mockMap.fitBounds).toHaveBeenCalledTimes(1);
    const bounds = mockMap.fitBounds.mock.calls[0][0];
    expect(bounds.points.map((p) => [p.lat(), p.lng()])).toEqual([[10, 20], [12, 22]]);
  });

  test("clusters the markers on a 60px grid", () => {
    render(<GMap markers={[markerA, markerB]} center={{ lat: 10, lng: 20 }} />);

    expect(GridAlgorithm).toHaveBeenCalledWith({ gridSize: 60 });
    expect(MarkerClusterer).toHaveBeenCalledWith(expect.objectContaining({ map: mockMap }));
    const clustered = mockClusterer.addMarkers.mock.calls.at(-1)[0];
    expect(clustered.map((m) => m.markerAt)).toEqual([
      { lat: 10, lng: 20 },
      { lat: 11, lng: 21 }
    ]);
  });
});
