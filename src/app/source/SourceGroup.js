/**
 * Created by qhyang on 2017/12/12.
 */

import Set from '../Set';

export default class SourceGroup extends Set {
    add(item) {
        item.active = true;

        return super.add(item);
    }

    search(keywords) {
        // TODO: change this later
        return this.get()[0].search(keywords);
    }
}
