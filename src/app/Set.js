/**
 * Created by qhyang on 2017/12/11.
 */

export default class Set {
    active;
    name;
    _items;

    get length() {
        return this._items.length;
    }

    constructor({ name }) {
        this.name = name;
        this._items = [];
        this.active = null;
    }

    update(items) {
        this._items = items;
    }

    /**
     *
     * Add item to the set, return the index of the item.
     *
     * @param {...Object} item
     * @returns {number}
     */
    add(...item) {
        this._items.push(...arguments);

        if (this._items.length === 1) {
            this.active = 0;
        }

        return this.length - 1;
    }

    get(index) {
        if (typeof index === 'number') {
            return this._items[index];
        }

        return this._items;
    }
}
