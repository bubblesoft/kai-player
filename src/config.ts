export default {
    colorSet: ["#4ccfff", "#c5ff52", "#fc33ff", "#ffff1a", "#160d80", "#ffa60d"],
    defaultIcon: "https://kaiplanet.net/favicon.ico",
    defaultImage: "https://kaiplanet.net/lighthouse.jpg",
    defaultPreference: {
        graphicEffect: .6,
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
