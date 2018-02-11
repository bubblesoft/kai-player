/**
 * Created by qhyang on 2017/12/11.
 */

export default class Set {
    active;
    _name;
    _items;

    get name() {
        return this._name;
    }

    get length() {
        return this._items.length;
    }

    constructor({ name }) {
        this._name = name;
        this._items = [];
    }

    /**
     *
     * Add item to the set, return the index of the item.
     *
     * @param item
     * @returns {number}
     */
    add(item) {
        this._items.push(item);

        return this.length - 1;
    }

    get(index) {
        if (typeof index === 'number') {
            return this._items[index];
        }

        return this._items;
    }
}
