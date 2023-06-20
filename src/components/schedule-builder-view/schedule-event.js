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

import React, {useState, useEffect} from 'react';
import {DraggableItemTypes} from './constants';
import {useDrag} from 'react-dnd';
import {Popover, OverlayTrigger} from 'react-bootstrap';
import RawHTML from '../raw-html';

const RESIZING_DIR_NORTH = 'N';
const RESIZING_DIR_SOUTH = 'S';

const ScheduleEvent = ({
                         event,
                         step,
                         initialTop,
                         initialHeight,
                         minHeight,
                         maxHeight,
                         canResize,
                         allowResize,
                         allowDrag,
                         onResized,
                         onUnPublishEvent,
                         onEditEvent,
                         onClickSelected,
                         selectedPublishedEvents,
                         onMoveEvent
                       }) => {
  const [collected, drag] = useDrag(() => ({
    type: DraggableItemTypes.SCHEDULEEVENT,
    item: {id: event.id, title: event.title, is_published: event.is_published, start_date: event.start_date, end_date: event.end_date, duration: event.duration},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: allowDrag && !event.static
  }), [event.id, event.duration, event.start_date, event.end_date]);
  const [resizeInfo, setResizeInfo] = useState({resizing: false, type: null, lastYPos: null});
  const [size, setSize] = useState({top: initialTop, height: initialHeight});
  const isSelected = selectedPublishedEvents?.includes(event.id) || false;
  const canEdit = !event.static;
  const isResizable = allowResize && canEdit && size.height > 15;

  const popoverHoverFocus = () =>
    <Popover id="popover-trigger-focus" title={event.title}>
      <RawHTML>{event.description}</RawHTML>
    </Popover>

  // resize behavior

  const onMouseDown = (evt) => {
    if (!evt.target.getAttribute('data-resizable')) return;

    const box = evt.target.getBoundingClientRect();

    let type;
    if (evt.clientY - box.top < 10) {
      type = RESIZING_DIR_NORTH;
    } else if (box.bottom - evt.clientY < 10) {
      type = RESIZING_DIR_SOUTH;
    } else {
      return;
    }

    setResizeInfo({resizing: true, type, lastYPos: evt.pageY});

    evt.preventDefault();
  }

  const onMouseMove = (evt) => {
    if (!resizeInfo.resizing) return;

    let lastYPos = resizeInfo.lastYPos;
    let newYPos = evt.pageY;
    let deltaY = newYPos - lastYPos;

    if (step && step > 0) {
      let steps = parseInt(Math.round(Math.abs(deltaY) / step));
      deltaY = Math.sign(deltaY) * steps * step;
      if (!deltaY) {
        evt.preventDefault();
        return false;
      }
    }

    let newHeight = size.height;
    let newTop = size.top;

    if (resizeInfo.type === RESIZING_DIR_SOUTH) {
      newHeight = size.height + deltaY;
    }

    if (resizeInfo.type === RESIZING_DIR_NORTH) {
      if (deltaY < 0) {
        newTop = size.top - Math.abs(deltaY);
        newHeight = size.height + Math.abs(deltaY);
      } else {
        newTop = size.top + Math.abs(deltaY);
        newHeight = size.height - Math.abs(deltaY);
      }
    }

    // check constraints
    if (newHeight < minHeight) {
      newHeight = minHeight;
      newYPos = lastYPos;
      newTop = size.top;
    }

    let maxHeightTmp = (typeof maxHeight === "function") ? maxHeight() : maxHeight;

    if (newHeight > maxHeightTmp) {
      newHeight = maxHeightTmp;
      newYPos = lastYPos;
      newTop = size.top;
    }

    if (newTop < 0) {
      newTop = 0;
      newHeight = size.height;
      newYPos = lastYPos;
    }

    if (canResize(event.id, newTop, newHeight)) {
      setResizeInfo({
        ...resizeInfo,
        resizing: true,
        lastYPos: newYPos
      });

      setSize({
        top: newTop,
        height: newHeight,
      });
    }

    evt.preventDefault();
  };

  const onMouseUp = (evt) => {
    evt.preventDefault();
    setResizeInfo({type: null, lastYPos: null, resizing: false});
  };
  
  const eventTitleBlock = () => {
    let block = null;
    
    if (event.description) {
      block = (<OverlayTrigger trigger={['hover']} placement="bottom" overlay={popoverHoverFocus()}>
        <div className="event-content">
          <span className="event-title withTooltip">{`${event.id} - ${event.title}${event.duration ? ` - ${event.duration/60} minutes` : ''}`}</span>
        </div>
      </OverlayTrigger>);
    } else {
      block = (<div className="event-content">
        <span className="event-title">{`${event.id} - ${event.title}${event.duration ? ` - ${event.duration/60} minutes` : ''}`}</span>
      </div>);
    }
    
    return block;
  }

  // end resize behavior

  useEffect(() => {
    if (resizeInfo.resizing) {
      document.addEventListener('mousemove', onMouseMove, false);
      document.addEventListener('mouseup', onMouseUp, false);
    } else {
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);

      if (size.top !== initialTop || size.height !== initialHeight) {
        onResized(event.id, size.top, size.height);
      }
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);
    }
  }, [resizeInfo.resizing])

  return (
    <div
      className={`row schedule-event ${isResizable ? 'is-resizable' : ''} ${canEdit ? '' : 'is-static'}`}
      data-resizable={true}
      id={`event_${event.id}`}
      onMouseDown={onMouseDown}
      ref={drag}
      style={{
        top: size.top,
        height: size.height,
        display: collected.isDragging ? 'none' : 'block',
        cursor: 'move',
      }}
    >
      {onClickSelected &&
      <div className="event-select-wrapper">
        <input
          className="select-event-btn"
          id={`selected_event_${event.id}`}
          type="checkbox"
          checked={isSelected}
          onChange={() => onClickSelected(event)}
        />
      </div>
      }
      <div className="col-md-12 event-container">
        {eventTitleBlock()}
      </div>
      <div className="event-actions">
        {!event.static && onUnPublishEvent &&
            <i
                className="fa fa-minus-circle event-action-btn"
                aria-hidden="true"
                title="unpublish event"
                onClick={() => onUnPublishEvent(event)}
            />
        }
        {onEditEvent &&
            <i
                className="fa fa-pencil-square-o event-action-btn"
                title="edit event"
                aria-hidden="true"
                onClick={() => onEditEvent(event)}
            />
        }
        {!event.static && onMoveEvent &&
          <i
              className="fa fa-arrow-circle-right event-action-btn"
              title="move event"
              aria-hidden="true"
              onClick={() => onMoveEvent(event)}
          />
        }
      </div>
    </div>
  );
}

export default ScheduleEvent;
