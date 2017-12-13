/**
 * Created by qhyang on 2017/12/12.
 */

export default class Channel {

    /**
     * 来源：
     *
     *　wy   网易云音乐
     *
     */
    source;

    /**
     * 列表类型
     *
     * hot  热歌榜
     */
    type;

    get name() {
        return this._name;
    }

    constructor({ source, type, name, get }) {

        this.source = source;
        this.type = type;
        this._name = name;
        this._get = get;
    }

    get() {
        return this._get();
    }
}
