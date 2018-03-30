/**
 * Created by qhyang on 2017/12/7.
 */

import Moment from 'moment';

import config from '../config';

import Track from '../app/Track';
import Artist from '../app/Artist';

const initHowlOnProgress = (howl) => {
    howl.interval, howl._onprogress = [];

    howl.on('play', function (soundId) {
        howl.interval = setInterval(function () {
            howl._emit('progress', soundId, howl.seek());
        }, 100);
    });

    howl.on('pause', function(){
        clearInterval(howl.interval);
    });


    howl.on('stop', function(){
        clearInterval(howl.interval);
    });

    howl.on('end', function(){
        clearInterval(howl.interval);
    });
};

const getRecommendedTrack = async (track, sources) => {
    const recommendedTrack = (await (await fetch(config.urlBase + '/audio/recommend', {
        method: 'POST',
        body: JSON.stringify({
            track: track ? {
                name: track.name,
                artists: track.artists.map(artist => artist.name)
            } : null,
            sources: sources.map(source => source.id)
        }),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })).json()).data;

    return new Track({
        id: recommendedTrack.source + '_' + recommendedTrack.id,
        name: recommendedTrack.name,
        duration: recommendedTrack.duration || null,
        artists: recommendedTrack.artists.map(artist => new Artist({ name: artist.name })),
        picture: recommendedTrack.picture
    });
};

const formatDuration = (val, formatStr) => {
    const prefix = function (val) {
        if (val < 10) {
            return "0" + val;
        } else {
            return val;
        }
    };

    let duration = Moment.duration(val);

    if (formatStr.match("hh")) {
        formatStr = formatStr.replace("hh", prefix(duration.get("hours")));
        formatStr = formatStr.replace("mm", prefix(duration.get("minutes")));
    } else {
        formatStr = formatStr.replace("mm", prefix(Math.floor(duration.asMinutes())));
    }
    formatStr = formatStr.replace("ss", prefix(duration.get("seconds")));

    return formatStr;
};

const loadImage = (url) => {
    return new Promise((resolve, reject) => {
        try {
            const image = new Image();

            image.onload = function() {
                resolve(image);
            };

            image.src = url;
        } catch (e) {
            reject(e);
        }
    });
};

export { initHowlOnProgress, getRecommendedTrack, formatDuration, loadImage };