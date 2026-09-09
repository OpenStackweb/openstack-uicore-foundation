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
import videojs from 'video.js'

import 'video.js/dist/video-js.css'

const YoutubeVideoComponent = ({ videoSrcURL, videoTitle }) => (
    <div className="video">
        <iframe
            width="100%"
            height="720"
            title={videoTitle}
            src={videoSrcURL}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    </div>
);


class LiveVideoPlayer extends React.Component {

    componentDidMount() {
        this.player = videojs(this.videoNode, this.props);
    }

    componentWillUnmount() {
        if (this.player) {
            this.player.dispose();
        }
    }

    render() {
        return (
            <div data-vjs-player="">
                <video ref={node => this.videoNode = node} className="video-js vjs-big-play-centered" />
            </div>
        );
    }
}

const VideoStream = ({ url }) => {
    let layout = null;
    const checkLiveVideo = () => {
        let isLiveVideo = null;
        url.match(/.m3u8/) ? isLiveVideo = true : isLiveVideo = false;
        return isLiveVideo;
    };

    if (url) {
        if (checkLiveVideo()) {
            const videoJsOptions = {
                autoplay: true,
                controls: true,
                fluid: true,
                sources: [{
                    src: url,
                    type: 'application/x-mpegURL'
                }]
            }
            layout = <LiveVideoPlayer {...videoJsOptions} />;
        } else {
            layout = <YoutubeVideoComponent videoSrcURL={url} />;
        }
    } else {
        layout = <span className="no-video">No video URL Provided</span>;
    }

    return layout;
};

VideoStream.propTypes = {
    /** A .m3u8 URL plays through video.js as a live stream; anything else is embedded in an iframe. Omit to render the "No video URL Provided" placeholder. */
    url: PropTypes.string
};

export default VideoStream;
