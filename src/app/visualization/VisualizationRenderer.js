/**
 * Created by qhyang on 2017/12/15.
 */

export default class VisualizationRenderer {
    constructor({ type }) {

    }

    mount(domNode) {
        this._domNode = domNode;
    }

    unMount() {
        return this._domNode;
    }

    render(data) {
        console.log(data);
    }
}