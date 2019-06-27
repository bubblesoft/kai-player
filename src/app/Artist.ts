/**
 * Created by qhyang on 2017/12/14.
 */

export default class Artist {
    private privateName: string;

    get name() {
        return this.privateName;
    }

    constructor({ name }: { name: string }) {
        this.privateName = name;
    }
}
