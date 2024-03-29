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

import moment from 'moment-timezone'

class SummitEvent {

    constructor(event, summit = null){
        this._event  = event;
        this._summit = summit;
    }

    set summit(summit){
        this._summit = summit;
    }

    get summit(){
        return this._summit;
    }

    getId(){
        return this._event.id;
    }

    isPublished(){
        return this._event.hasOwnProperty('is_published') && this._event.is_published;
    }

    getMinutesDuration(slotSize){

        if(this._event.hasOwnProperty('start_date') && this._event.hasOwnProperty('end_date')  && this._event.start_date != null && this._event.end_date != null ) {
            let eventStartDateTime = moment(this._event.start_date * 1000).tz(this._summit.time_zone.name);
            let eventEndDateTime   = moment(this._event.end_date * 1000).tz(this._summit.time_zone.name);
            return eventEndDateTime.diff(eventStartDateTime, 'minutes');
        }
        // default

        return this._event.hasOwnProperty('duration') && this._event.duration > 0 ?  parseInt( this._event.duration / 60 ) : slotSize;
    }

    canMove(siblings, day, startTime, interval){

        let duration       = this._event.hasOwnProperty('duration') && this._event.duration > 0 ?  parseInt( this._event.duration / 60 ) : interval;
        // check if published to get real duration ...
        if(this.isPublished())
            duration = this.getMinutesDuration();

        let startDateTime   = moment.tz(day+' '+ startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm', this._summit.time_zone.name);
        let endDateTime     = moment.tz(day+' '+ startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm', this._summit.time_zone.name);
        endDateTime         = endDateTime.add(duration, 'minutes');

        // check siblings overlap
        for (let auxEvent of siblings.filter(item => item.id !== this.getId())) {
            let auxEventStartDateTime = moment(auxEvent.start_date * 1000).tz(this._summit.time_zone.name);
            let auxEventEndDateTime   = moment(auxEvent.end_date * 1000).tz(this._summit.time_zone.name);

            // if time segments overlap
            if(auxEventStartDateTime.isBefore(endDateTime) && auxEventEndDateTime.isAfter(startDateTime))
                return false;
        }

        return true;
    }

    calculateNewDates(day, startTime, minutes){

        minutes = this._event.hasOwnProperty('duration') && this._event.duration > 0 ?
            parseInt( this._event.duration / 60 ) : minutes;

        let newStarDateTime = moment.tz(day+' '+startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm', this._summit.time_zone.name);
        let newEndDateTime  = moment.tz(day+' '+startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm', this._summit.time_zone.name).add(minutes, 'minutes');
        return [newStarDateTime, newEndDateTime];
    }

    isValidEndDate(endDate){
        if(!endDate) return true;
        const _endDate        = moment.tz(endDate * 1000, this._summit.time_zone.name);
        const summitEndDate   = moment.tz(this._summit.end_date * 1000, this._summit.time_zone.name);
        const startDate       = moment.tz(this._event.start_date * 1000, this._summit.time_zone.name);
        return _endDate.isSameOrBefore(summitEndDate) && _endDate.isAfter(startDate);
    }

    isValidStartDate(startDate){
        if(!startDate) return true;
        const _startDate  = moment.tz(startDate * 1000, this._summit.time_zone.name);
        // if we have set duration , end date is optional
        const durationInMinutes = this._event.hasOwnProperty('duration') && this._event.duration > 0 ?
            parseInt( this._event.duration / 60 ) : 0;
        const summitStartDate = moment.tz(this._summit.start_date * 1000, this._summit.time_zone.name);
        const endDate         = this._event.end_date ?
            moment.tz(this._event.end_date * 1000, this._summit.time_zone.name):
            ( durationInMinutes > 0 ? moment.tz(startDate * 1000, this._summit.time_zone.name).add(durationInMinutes, 'minutes'): null);

        return _startDate.isSameOrAfter(summitStartDate) && moment.isMoment(endDate) && _startDate.isBefore(endDate);
    }

    isValidTitle(title){
        return title.trim() !== '';
    }

    isValid(){
        return this.isValidTitle(this._event.title)
            && this.isValidStartDate(this._event.start_date)
            && this.isValidEndDate(this._event.end_date);
    }

}

export default SummitEvent;
