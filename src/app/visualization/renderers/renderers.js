/**
 * Created by qhyang on 2018/3/1.
 */

import ThreeRenderer from './ThreeRenderer';
import HistogramRenderer from './HistogramRenderer';
import WavingRibbonRenderer from "./WavingRibbonRenderer";
import ElectricArcRenderer from './ElectricArcRenderer';
import ArtworkRenderer from './ArtworkRenderer';

const three = new ThreeRenderer,
    histogram = new HistogramRenderer,
    ribbon = new WavingRibbonRenderer,
    electricArc = new ElectricArcRenderer,
    artwork = new ArtworkRenderer;

export { three, histogram, ribbon, electricArc, artwork };
