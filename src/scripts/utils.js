/**
 * Created by qhyang on 2017/12/7.
 */

import momnet from 'moment';

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

    let duration = momnet.duration(val);

    if (formatStr.match("hh")) {
        formatStr = formatStr.replace("hh", prefix(duration.get("hours")));
        formatStr = formatStr.replace("mm", prefix(duration.get("minutes")));
    } else {
        formatStr = formatStr.replace("mm", prefix(Math.floor(duration.asMinutes())));
    }
    formatStr = formatStr.replace("ss", prefix(duration.get("seconds")));

    return formatStr;
};

const generateLayout = (type, viewportWidth, viewportHeight) => {
    if (type === 'desktop') {
        let width = viewportWidth * .3;

        (width < 300) && (width = 300);
        (width > 500) && (width = 500);

        return {
            picture: { mode: 'leftTop', visible: true, x: viewportWidth * .03, y: viewportWidth * .03 - 40, width: Math.min(viewportWidth * .25, 400), height: Math.min(viewportWidth * .25, 400), opacity: .4, autoHide: true },
            source: { mode: 'bottom', visible: true, attach: 'left', bottomY: viewportHeight * .4, width: 258, height: 173, opacity: .4 },
            list: { mode: 'bottom', visible: true, attach: 'right', bottomY: viewportHeight * .35, width, height: viewportHeight * .45, opacity: .4 },
            search: { mode: 'bottom', visible: true, attach: 'left', bottomY: viewportHeight * .03, width, height: viewportHeight * .35, opacity: .4 },
            playlist: { mode: 'bottom', visible: true, attach: 'right', bottomY: 0, width, height: viewportHeight * .35, opacity: .4 },
            tracks: { mode: 'bottom', visible: true, attach: false, ratioX: .5, bottomY: viewportHeight * .08, width: width * 1.1, height: viewportHeight * .45, opacity: .4 }
        };
    } else if (type === 'mobile') {
        return {
            picture: { mode: 'ratio', visible: false, x: .03, y: .03, width: .5, height: .3, opacity: .4, autoHide: true },
            source: { mode: 'ratio', visible: false, attach: 'left', y: .1, width: 1, height: .3, opacity: .4 },
            list: { mode: 'ratio', visible: true, attach: 'left', y: .05, width: 1, height: .37, opacity: .4 },
            search: { mode: 'ratio', visible: false, attach: 'left', y: 0, width: 1, height: .4, opacity: .4 },
            playlist: { mode: 'ratio', visible: true, attach: 'left', y: .42, width: 1, height: .28, opacity: .4 },
            tracks: { mode: 'ratio', visible: true, attach: 'left', y: .7, width: 1, height: .3, opacity: .4 }
        };
    }
}

const loadImage = url => {
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

export { initHowlOnProgress, getRecommendedTrack, formatDuration, generateLayout, loadImage };