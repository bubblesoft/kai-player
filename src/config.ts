export default {
    colorSet: ["#4ccfff", "#c0ff05", "#fc33ff", "#ffff00", "#0d0033", "#ffa60d"],
    defaultIcon: "https://kai-player.oss-cn-shanghai.aliyuncs.com/kaiplanet.ico",
    defaultImages: [
        "https://kai-player.oss-cn-shanghai.aliyuncs.com/bay.jpg",
        "https://kai-player.oss-cn-shanghai.aliyuncs.com/sea.jpg",
        "https://kai-player.oss-cn-shanghai.aliyuncs.com/lighthouse.jpg",
    ],
    defaultPreference: {
        performanceFactor: .8,
        playback: {
            alternativeTracks: {
                enable: true,
                similarityRange: {
                    high: 1,
                    low: .8,
                },
            },
            timeToWait: 3000,
            timeout: 6000,
        },
    },
    queue: {
        randomQueueThreshold: 10,
    },
};
