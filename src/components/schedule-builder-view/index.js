import React, {useMemo} from 'react';
import SummitDaysSelect from "../inputs/summit-days-select";
import SummitVenuesSelect from "../inputs/summit-venues-select";
import SteppedSelect from "../inputs/stepped-select/index.jsx";
import ScheduleEventList from "./schedule-event-list";
import {epochToMomentTimeZone} from "../../utils/methods";
import BulkActionsSelector from "../bulk-actions-selector/index.js";
import {TBALocation, SlotSizeOptions, PixelsPerMinute, bulkOptions} from "./constants";
import T from 'i18n-react';

import './schedule-builder-view.less';

const getDaysOptions = (summit) => {
    const days = [];
    const summitLocalStartDate = epochToMomentTimeZone(summit.start_date, summit.time_zone_id);
    const summitLocalEndDate = epochToMomentTimeZone(summit.end_date, summit.time_zone_id);
    let currentAuxDay = summitLocalStartDate.clone();
    
    do {
        const option = {value: currentAuxDay.format("YYYY-MM-DD"), label: currentAuxDay.format('dddd Do , MMMM YYYY')};
        days.push(option);
        currentAuxDay = currentAuxDay.clone();
        currentAuxDay.add(1, 'day');
    } while (!currentAuxDay.isAfter(summitLocalEndDate));
    
    return days;
};

const getVenuesOptions = (summit) => {
    const venues = [
        { value: TBALocation, label: TBALocation.name}
    ];
    
    for (let i = 0; i < summit.locations.length; i++) {
        const location = summit.locations[i];
        if (location.class_name !== "SummitVenue") continue;
        const option = {value: location, label: location.name};
        
        venues.push(option);
        
        if (!location.hasOwnProperty('rooms')) continue;
        for (let j = 0; j < location.rooms.length; j++) {
            let subOption = {value: location.rooms[j], label: location.rooms[j].name};
            venues.push(subOption);
        }
    }
    
    return venues;
};

const ScheduleBuilderView = ({summit, slotOptions, scheduleEvents, selectedEvents, currentDay, currentVenue, slotSize, hideBulkSelect, ...props}) => {
    const days = useMemo(() => getDaysOptions(summit), [summit.start_date, summit.end_date]);
    const venues = useMemo(() => getVenuesOptions(summit), [summit.locations]);
    const slotSizeOptions = SlotSizeOptions.map(op => ({value: op, label: `${op} min.`}));
    const {allowResize = true, allowDrag = true} = props;
    
    return (
        <>
            <SummitDaysSelect
                onDayChanged={props.onDayChanged}
                days={days}
                currentValue={currentDay}
                placeholder="Select Day"
            />
            <div className="row">
                <div className="col-md-8">
                    <SummitVenuesSelect
                        onVenueChanged={props.onVenueChanged}
                        venues={venues}
                        currentValue={currentVenue}
                        placeholder="Select Room"
                    />
                </div>
                <div className="col-md-4">
                    <span>Slot size: </span>
                    <SteppedSelect
                        value={slotSize}
                        onChange={props.onSlotSizeChange}
                        options={slotSizeOptions}
                        style={{display: 'inline-block', marginLeft: 10}}
                    />
                </div>
            </div>
            {!hideBulkSelect && scheduleEvents.length > 0 &&
                <BulkActionsSelector
                    bulkOptions={props.customBulkOptions || bulkOptions}
                    onSelectAll={props.onSelectAll}
                    onSelectedBulkAction={props.onSelectedBulkAction}
                />
            }
            {currentDay && currentVenue &&
                <ScheduleEventList
                    startTime="00:00"
                    endTime="23:50"
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
                />
            }
        </>
    );
}

export default ScheduleBuilderView;
