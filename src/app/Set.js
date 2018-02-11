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
    }

    update(items) {
        this._items = items;
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

    insert(index, ...items) {
        this._items.splice(index, 0 , ...items);
    }

    get(index) {
        if (typeof index === 'number') {
            return this._items[index];
        }

        return this._items;
    }
}
