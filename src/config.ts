export default {
    colorSet: ["#4ccfff", "#c5ff52", "#fc33ff", "#ffff1a", "#160d80", "#ffa60d"],
    defaultIcon: "http://kaiplanet.net/favicon.ico",
    defaultImage: "http://kaiplanet.net/lighthouse.jpg",
    defaultPreference: {
        playback: {
            alternativeTracks: {
                enable: true,
                similarityRange: {
                    high: 1,
                    low: .9,
                },
            },
            timeToWait: 3000,
        },
    },
    queue: {
        randomQueueThreshold: 10,
    },
};
