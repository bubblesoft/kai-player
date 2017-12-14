/**
 * Created by qhyang on 2017/12/14.
 */

export default class Artist {
    get name() {
        return this._name;
    }

    constructor({ name }) {
        this._name = name;
    };
}