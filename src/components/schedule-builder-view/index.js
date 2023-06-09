import React, {useEffect, useMemo} from 'react';
import SummitDaysSelect from "../inputs/summit-days-select";
import SummitVenuesSelect from "../inputs/summit-venues-select";
import SteppedSelect from "../inputs/stepped-select/index.jsx";
import ScheduleEventList from "./schedule-event-list";
import {epochToMomentTimeZone} from "../../utils/methods";
import BulkActionsSelector from "../bulk-actions-selector/index.js";
import {bulkOptions, PixelsPerMinute, SlotSizeOptions, TBALocation} from "./constants";
import {parseLocationHour} from '../../utils/methods'

import './schedule-builder-view.less';

const getDaysOptions = (summit, trackSpaceTime, currentLocation) => {
    const days = [];
    const summitLocalStartDate = epochToMomentTimeZone(summit.start_date, summit.time_zone_id);
    const summitLocalEndDate = epochToMomentTimeZone(summit.end_date, summit.time_zone_id);
    let currentAuxDay = summitLocalStartDate.clone();
    const allowedDays =
        trackSpaceTime
            ?.find(sp => sp.location_id === currentLocation?.id)
            ?.allowed_timeframes?.map(
                at => epochToMomentTimeZone(at.day, summit.time_zone_id).format("YYYY-MM-DD")
        ) || null;
    
    do {
        const option = {
            value: currentAuxDay.format("YYYY-MM-DD"),
            label: currentAuxDay.format('dddd Do , MMMM YYYY')
        };
        
        if (!allowedDays || allowedDays.length === 0 || allowedDays.includes(option.value)) {
            days.push(option);
        }
        currentAuxDay = currentAuxDay.clone();
        currentAuxDay.add(1, 'day');
    } while (!currentAuxDay.isAfter(summitLocalEndDate));
    
    return days;
};

const getVenuesOptions = (summit, trackSpaceTime) => {
    const venues = [{value: TBALocation, label: TBALocation.name}];
    const allowedLocationIds = trackSpaceTime?.map(st => st.location_id) || null;
    
    const locations = summit.locations.filter(loc => {
        const isNotVenue = loc.class_name !== "SummitVenue";
        const isAllowed = allowedLocationIds ? allowedLocationIds.includes(loc.id) : true;
        return isNotVenue && isAllowed;
    })
    
    locations.forEach(loc => {
        const option = {value: loc, label: loc.name};
        venues.push(option);
        if (loc.hasOwnProperty('rooms')) {
            loc.rooms.forEach(r => {
                const subOption = {value: r, label: r.name};
                venues.push(subOption);
            })
        }
    })
    
    return venues;
};

const getTimeframe = (currentDay, currentLocation, trackSpaceTime, summitTZ) => {
    if (currentDay && currentLocation && trackSpaceTime) {
        const allowedDays = trackSpaceTime.find(st => st.location_id === currentLocation.id)?.allowed_timeframes;
        
        if (allowedDays?.length > 0) {
            const allowedTimeFrame = allowedDays?.find(tf => epochToMomentTimeZone(tf.day, summitTZ).format("YYYY-MM-DD") === currentDay);
            if (allowedTimeFrame) {
                return {open: parseLocationHour(allowedTimeFrame.opening_hour), close: parseLocationHour(allowedTimeFrame.closing_hour)};
            }
        }
    }
    
    if (currentLocation?.opening_hour && currentLocation?.closing_hour) {
        return {open: parseLocationHour(currentLocation.opening_hour), close: parseLocationHour(currentLocation.closing_hour)};
    }
    
    return {open: "00:00", close: "23:50"};
};

const ScheduleBuilderView = ({
                                 summit,
                                 trackSpaceTime,
                                 scheduleEvents,
                                 selectedEvents,
                                 currentDay,
                                 currentVenue,
                                 slotSize,
                                 hideBulkSelect,
                                 ...props
                             }) => {
    const days = useMemo(() => getDaysOptions(summit, trackSpaceTime, currentVenue), [summit.start_date, summit.end_date, trackSpaceTime, currentVenue]);
    const venues = useMemo(() => getVenuesOptions(summit, trackSpaceTime), [summit.locations, trackSpaceTime]);
    const slotSizeOptions = SlotSizeOptions.map(op => ({value: op, label: `${op} min.`}));
    const {allowResize = true, allowDrag = true} = props;
    const {open, close} = useMemo(() => getTimeframe(currentDay, currentVenue, trackSpaceTime, summit.time_zone_id), [currentDay, currentVenue, trackSpaceTime]);
    
    useEffect(() => {
        // if new location doesn't allow currentDay value, reset
        if (currentDay && !days.find(op => op.value === currentDay)) {
            props.onDayChanged(null);
        }
    }, [currentVenue])
    
    return (
        <div className="schedule-view-wrapper">
            {props.onSlotSizeChange &&
                <div className="row" style={{marginBottom: 12, marginTop: 2}}>
                    <div className="col-md-12">
                        <span>Slot size: </span>
                        <SteppedSelect
                            value={slotSize}
                            onChange={props.onSlotSizeChange}
                            options={slotSizeOptions}
                            style={{display: 'inline-block', marginLeft: 10}}
                        />
                    </div>
                </div>
            }
            <div className="row">
                <div className="col-md-6">
                    <SummitVenuesSelect
                        onVenueChanged={props.onVenueChanged}
                        venues={venues}
                        currentValue={currentVenue}
                        placeholder="Select Room"
                    />
                </div>
                <div className="col-md-6">
                    <SummitDaysSelect
                        onDayChanged={props.onDayChanged}
                        days={days}
                        currentValue={currentDay}
                        placeholder="Select Day"
                    />
                </div>
            </div>
            <BulkActionsSelector
                bulkOptions={props.customBulkOptions || bulkOptions}
                onSelectAll={props.onSelectAll}
                onSelectedBulkAction={props.onSelectedBulkAction}
                show={!hideBulkSelect && scheduleEvents.length > 0}
            />
            
            {currentDay && currentVenue &&
                <ScheduleEventList
                    startTime={open}
                    endTime={close}
                    currentSummit={summit}
                    interval={slotSize}
                    currentDay={currentDay}
                    pixelsPerMinute={PixelsPerMinute}
                    canDropEvent={props.canDropEvent}
                    allowResize={allowResize}
                    allowDrag={allowDrag}
                    onScheduleEvent={props.onScheduleEvent}
                    events={scheduleEvents}
                    onUnPublishEvent={props.onUnPublishEvent}
                    onEditEvent={props.onEditEvent}
                    onClickSelected={props.onClickSelected}
                    selectedPublishedEvents={selectedEvents}
                    onMoveEvent={props.onMoveSingleEvent}
                />
            }
        </div>
    );
}

export default ScheduleBuilderView;
