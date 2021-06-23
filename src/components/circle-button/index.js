/**
 * Copyright 2020 OpenStack Foundation
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

import React from 'react';
import PropTypes from 'prop-types';

import styles from './index.module.scss';

const isLive = (event, nowUtc) => {
    const hasEnded = nowUtc > event.end_date;
    const hasStarted = (event.start_date - nowUtc) < 1;
    return hasStarted && !hasEnded;
};

const CircleButton = ({event, isScheduled, nowUtc, addToSchedule, removeFromSchedule, enterClick}) => {

    const isLiveNow = isLive(event, nowUtc);
    let buttonClass = null;
    let iconClass = null;
    let onClick = null;
    const handleClick = (ev, action) => {
        ev.preventDefault();
        ev.stopPropagation();
        action(event);
    };


    if (isLiveNow) {
        buttonClass = `${styles.enter} enter`;
        iconClass = 'fa-sign-in';
        onClick = ev => handleClick(ev, enterClick);
    } else if (removeFromSchedule && addToSchedule && isScheduled) {
        buttonClass = `${styles.added} added`;
        iconClass = 'fa-check';
        onClick = ev => handleClick(ev, removeFromSchedule);
    } else if (removeFromSchedule && addToSchedule) {
        buttonClass = `${styles.add} add`;
        iconClass = 'fa-plus';
        onClick = ev => handleClick(ev, addToSchedule);
    }

    if (!onClick) return null;


    return (
        <button className={`${styles.circleButton} ${buttonClass}`} onClick={onClick}>
            <i className={`fa ${iconClass}`} aria-hidden="true" />
        </button>
    );
};

CircleButton.propTypes = {
    event: PropTypes.object.isRequired,
    nowUtc: PropTypes.number.isRequired,
    isScheduled: PropTypes.bool.isRequired,
    enterClick: PropTypes.func.isRequired,
    addToSchedule: PropTypes.func,
    removeFromSchedule: PropTypes.func,
};

CircleButton.defaultProps = {
    addToSchedule: console.log,
    removeFromSchedule: console.log,
};

export default CircleButton;
