/**
 * Copyright 2017 OpenStack Foundation
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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { APIProvider, InfoWindow, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { GridAlgorithm, MarkerClusterer } from '@googlemaps/markerclusterer';
import { arraysEqual } from '../../utils/methods';

const MAP = {
    defaultZoom: 2,
    defaultCenter: { lat: 30.270166, lng: -97.731271 },
    clusterGridSize: 60,
    readyPollMs: 100
};

// the app loads the Maps script globally; vis.gl's loader reuses it once importLibrary exists
const isGoogleMapsReady = () => Boolean(window.google?.maps?.importLibrary);

const markerIdsKey = (markers) => markers.map(m => m.id).sort().join();

const MapContent = ({ markers: markersProp, center, zoom, draggable, onMarkerDragged, onMapClick, onChangeCallback }) => {
    const map = useMap();
    const [markers, setMarkers] = useState(markersProp);
    const [markerInstances, setMarkerInstances] = useState({});
    const prevMarkersProp = useRef(markersProp);
    const clusterer = useRef(null);

    // keep local markers (with their info-window state) until the consumer sends different ones
    useEffect(() => {
        const prevMarkers = prevMarkersProp.current;
        prevMarkersProp.current = markersProp;
        if (!arraysEqual(markersProp, prevMarkers)) setMarkers(markersProp);

        if (map && markersProp.length > 1 && markerIdsKey(markersProp) !== markerIdsKey(prevMarkers)) {
            const bounds = new google.maps.LatLngBounds();
            markersProp.forEach(m => bounds.extend(new google.maps.LatLng(m.lat, m.lng)));
            map.fitBounds(bounds);
        }
    }, [markersProp, map]);

    useEffect(() => {
        if (map) map.setZoom(zoom);
    }, [map, zoom]);

    useEffect(() => {
        if (map) map.setCenter(center);
    }, [map, center.lat, center.lng]);

    useEffect(() => {
        if (!map) return undefined;
        clusterer.current = new MarkerClusterer({
            map,
            algorithm: new GridAlgorithm({ gridSize: MAP.clusterGridSize })
        });
        return () => {
            clusterer.current.clearMarkers();
            clusterer.current = null;
        };
    }, [map]);

    useEffect(() => {
        if (!clusterer.current) return;
        clusterer.current.clearMarkers();
        clusterer.current.addMarkers(Object.values(markerInstances));
    }, [markerInstances, map]);

    const setMarkerInstance = useCallback((id, instance) => {
        setMarkerInstances(prev => {
            if (instance && prev[id] === instance) return prev;
            if (!instance && !(id in prev)) return prev;
            const next = { ...prev };
            if (instance) next[id] = instance;
            else delete next[id];
            return next;
        });
    }, []);

    // one stable ref callback per marker, so React doesn't detach/reattach (and re-set state) every render
    const refCallbacks = useRef({});
    const markerRef = (id) => {
        if (!refCallbacks.current[id]) {
            refCallbacks.current[id] = instance => setMarkerInstance(id, instance);
        }
        return refCallbacks.current[id];
    };

    const toggleInfoWindow = (id) => {
        setMarkers(prev => prev.map(m => (m.id === id ? { ...m, isInfoWindowOpen: !m.isInfoWindowOpen } : m)));
    };

    const handleBoundsChanged = (ev) => {
        if (!onChangeCallback) return;
        const bounds = ev.map.getBounds();
        onChangeCallback(markersProp.filter(m => bounds.contains(new google.maps.LatLng(m.lat, m.lng))));
    };

    const handleMapClick = (ev) => {
        if (onMapClick && ev.detail.latLng) onMapClick(ev.detail.latLng.lat, ev.detail.latLng.lng);
    };

    return (
        <Map
            defaultZoom={zoom}
            defaultCenter={center}
            onBoundsChanged={handleBoundsChanged}
            onClick={handleMapClick}
            style={{ height: '100%' }}
        >
            {markers.map(marker => (
                <React.Fragment key={marker.id}>
                    <Marker
                        ref={markerRef(marker.id)}
                        position={{ lat: marker.lat, lng: marker.lng }}
                        draggable={draggable}
                        onClick={() => toggleInfoWindow(marker.id)}
                        onDragEnd={ev => onMarkerDragged && onMarkerDragged(ev.latLng.lat(), ev.latLng.lng())}
                    />
                    {marker.isInfoWindowOpen && markerInstances[marker.id] &&
                    <InfoWindow anchor={markerInstances[marker.id]} onCloseClick={() => toggleInfoWindow(marker.id)}>
                        <div>{marker.name}</div>
                    </InfoWindow>
                    }
                </React.Fragment>
            ))}
        </Map>
    );
};

export const GMap = (props) => {
    const [ready, setReady] = useState(isGoogleMapsReady);
    const { markers, zoom, center } = props;

    // wait for the app's own script so the loader never injects a second one
    useEffect(() => {
        if (ready) return undefined;
        const timer = setInterval(() => {
            if (isGoogleMapsReady()) {
                clearInterval(timer);
                setReady(true);
            }
        }, MAP.readyPollMs);
        return () => clearInterval(timer);
    }, [ready]);

    return (
        <div style={{ height: '400px' }}>
            {ready ? (
                <APIProvider apiKey="">
                    <MapContent
                        markers={markers}
                        zoom={zoom || MAP.defaultZoom}
                        center={center?.lat ? center : MAP.defaultCenter}
                        draggable={Object.prototype.hasOwnProperty.call(props, 'draggable')}
                        onMarkerDragged={props.onMarkerDragged}
                        onMapClick={props.onMapClick}
                        onChangeCallback={props.onChangeCallback}
                    />
                </APIProvider>
            ) : (
                <div style={{ height: '100%' }} />
            )}
        </div>
    );
};

GMap.propTypes = {
    /** [{ id, lat, lng, name, isInfoWindowOpen? }] */
    markers: PropTypes.array.isRequired,
    center: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
    zoom: PropTypes.number,
    /** Presence makes markers draggable, as before (the value is not read). */
    draggable: PropTypes.bool,
    /** Receives (lat, lng) when a marker is dropped. */
    onMarkerDragged: PropTypes.func,
    /** Receives (lat, lng) when the map is clicked. */
    onMapClick: PropTypes.func,
    /** Receives the markers inside the visible bounds whenever they change. */
    onChangeCallback: PropTypes.func
};

export default GMap;
