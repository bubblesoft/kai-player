/**
 * Created by qhyang on 2017/12/7.
 */

import Moment from 'moment';

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

const mapPanelHeading = type => {
    switch (type) {
        case 'playlist':
            return 'Playlist';
        default:
            return 'Panel';
    }
};

export { initHowlOnProgress, formatDuration, mapPanelHeading };