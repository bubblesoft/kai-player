type Preference = {
    performanceFactor: number;
    playback: {
        alternativeTracks: {
            enable: boolean;
            similarityRange: {
                high: number;
                low: number;
            }
        };
        timeToWait: number;
        timeout: number;
    };
}

export default Preference;
