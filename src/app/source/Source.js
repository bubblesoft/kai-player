/**
 * Created by qhyang on 2017/12/12.
 */

import Set from '../Set';

export default class Source extends Set {

    /**
     * 来源：
     *
     *　wy   网易云音乐
     *
     */
    source;

    constructor({ source, name }) {
        super({ name });

        this.source = source;
    }
}
