/**
 * Created by qhyang on 2018/5/16.
 */

const chai = require('chai');
const expect = chai.expect;

import  { initHowlOnProgress, getRecommendedTrack, formatDuration, generateLayout, loadImage, mapMediaSourceIcon, mapMediaSourceName } from '../../src/scripts/utils';

describe('formatDuration', () => {
    it('format different timestamp value according to the format string passed', () => {
        expect(formatDuration(0, 'mm:ss')).to.equal('00:00');
        expect(formatDuration(100000, 'mm:ss')).to.equal('01:40');
        expect(formatDuration(100000, 'hh:mm:ss')).to.equal('00:01:40');
    });
});