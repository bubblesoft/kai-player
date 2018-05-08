/**
 * Created by qhyang on 2018/3/1.
 */

import ThreeRenderer from './ThreeRenderer';
import HistogramRenderer from './HistogramRenderer';
import ElectricArcRenderer from './ElectricArcRenderer';
import ArtworkRenderer from './ArtworkRenderer';

const threeRenderer = new ThreeRenderer,
    histogramRenderer = new HistogramRenderer,
    electricArcRenderer = new ElectricArcRenderer,
    artworkRenderer = new ArtworkRenderer;

export { threeRenderer, histogramRenderer, electricArcRenderer, artworkRenderer };
