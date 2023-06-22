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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Document, Page, StyleSheet, View, Text, Image } from '@react-pdf/renderer';
import { convertSVGtoImg, getEventHosts, getEventLocation, epochToMomentTimeZone } from '../../utils/methods';

// Create styles
const styles = StyleSheet.create({
  header: {
    fontSize: '18px',
    textAlign: 'center'
  },
  headlineWrapper: {
    margin: '0 10px 20px',
    display: 'flex',
    flexDirection: 'row',
  },
  headline: {
    margin: 'auto'
  },
  logo: {
    marginRight: '20px',
    backgroundColor: 'lightgray'
  },
  subtitle: {
    padding: '10px',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: '8px',
    textTransform: 'uppercase'
  },
  eventList: {
    flexDirection: 'column',
    display: 'flex',
    overflow: 'hidden',
    padding: '20px'
  },
  eventWrapper: {
    margin: 5,
    padding: 5,
    border: '1px solid black'
  },
  locationWrapper: {
    marginBottom: 8,
    fontSize: '10px',
    color: '#4A4A4A',
    fontWeight: 600,
  },
  title: {
    marginBottom: 10,
    display: 'inline-flex',
    fontSize: '12px',
    color: '#4A4A4A',
    fontWeight: 600,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  leftCol: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    maxWidth: '65%',
  },
  speakers: {
    fontSize: '10px',
    color: '#4A4A4A',
  },
  trackWrapper: {
    fontWeight: 'bold',
    fontSize: '10px',
    position: 'relative',
    marginTop: 'auto',
  },
  rightCol: {
    maxWidth: '35%'
  },
  tagsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'right'
  },
  tag: {
    backgroundColor: '#F6F6F6',
    borderRadius: '8px',
    height: '10px',
    margin: '4px 4px 0 0',
    padding: '1px 2px',
    textTransform: 'uppercase',
    fontSize: '6px',
    color: '#4A4A4A',
  }
});

const SchedulePrintView = ({ events, summit, nowUtc }) => {
  const [imgData, setImgData] = useState(null);
  const getSpeakers = (event) => {
    const speakerTags = getEventHosts(event).map(sp => `${sp.first_name} ${sp.last_name}`);

    if (speakerTags.length > 0) {
      return (
        <View style={styles.speakers}>
          <Text>By {speakerTags.join(', ')}</Text>
        </View>
      );
    }

    return null;
  };

  const sortedEvents = events.sort((a,b) => a.start_date - b.start_date);
  const venue = summit.locations.find(l => l.class_name === 'SummitVenue');
  const summitStart = epochToMomentTimeZone(summit.start_date, summit.time_zone_id).format('MMMM Do YYYY');
  const summitEnd = epochToMomentTimeZone(summit.end_date, summit.time_zone_id).format('MMMM Do YYYY');
  
  useEffect(() => {
    if (summit.logo) {
      const getPngLogo = async () => {
        const _imgData = await convertSVGtoImg(summit.logo);
        setImgData(_imgData);
      }

      getPngLogo();
    }
  }, [summit.logo])

  if (!imgData) return null;

  return (
    <Document>
      <Page size='A4' style={styles.eventList}>
        <View style={styles.header}>
          <View style={styles.headlineWrapper}>
            <Image src={imgData.url} style={{...styles.logo, width: imgData.width, height: imgData.height}} />
            <Text style={styles.headline}>Schedule for {summit.name}</Text>
          </View>
          <View style={styles.subtitle}>
            <View>
              <Text style={styles.label}>Venue:</Text><Text>{venue?.name}</Text>
            </View>
            <View>
              <Text style={styles.label}>Start:</Text><Text>{summitStart}</Text>
            </View>
            <View>
              <Text style={styles.label}>End:</Text><Text>{summitEnd}</Text>
            </View>
          </View>
        </View>
        {sortedEvents.map(event => {
          const eventDate = epochToMomentTimeZone(event.start_date, summit.time_zone_id).format('ddd, MMMM D');
          const eventStartTime = epochToMomentTimeZone(event.start_date, summit.time_zone_id).format('h:mma');
          const eventEndTime = epochToMomentTimeZone(event.end_date, summit.time_zone_id).format('h:mma');
          const venueCount = summit.locations.filter(loc => loc.class_name === 'SummitVenue');
          const locationStr = getEventLocation(event, venueCount, summit.start_showing_venues_date, nowUtc);
          const eventColorStyle = event.eventColor ? {borderLeft: `4px solid ${event.eventColor}`} : {};

          return (
            <View
              style={{...styles.eventWrapper, ...eventColorStyle}}
              key={`event-${event.id}`}
              wrap={false}
            >
              <View style={styles.locationWrapper}>
                <Text>
                  {`${eventDate}, ${eventStartTime} - ${eventEndTime} | ${locationStr}`}
                </Text>
              </View>
              <View style={styles.title}>
                <Text>{event.title}</Text>
              </View>
              <View style={styles.footer}>
                <View style={styles.leftCol}>
                  {event.track &&
                    <View style={styles.trackWrapper}>
                      <Text>{event.track?.name}</Text>
                    </View>
                  }
                  {(event.speakers?.length > 0 || event.moderator) &&
                    <View>
                      {getSpeakers(event)}
                    </View>
                  }
                </View>
                <View style={styles.rightCol}>
                  <View style={styles.tagsWrapper}>
                    {event.tags?.map(t =>
                      <View key={`tag-${t.id}-${event.id}`} style={styles.tag}>
                        <Text>{t.tag}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

SchedulePrintView.propTypes = {
  events: PropTypes.array.isRequired,
  summit: PropTypes.object.isRequired
};

export default SchedulePrintView;

