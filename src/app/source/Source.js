/**
 * Created by qhyang on 2017/12/12.
 */

import Set from '../Set';

export default class Source extends Set {

    get id() {
        return this._id;
    }

    constructor({ id, name }) {
        super({ name });

        this._id = id;
    }
}
