import IQueue from "./IQueue";

import Set from "./Set";

const modes = ["repeat", "repeatOne", "shuffle"];

export default class<T> extends Set<T> implements IQueue<T> {
    protected modeIndex = 0;

    get mode() {
        return modes[this.modeIndex];
    }

    constructor({ name, mode }: { name?: string, mode?: string } = {}) {
        super({ name });

        if (mode) {
            this.modeIndex = modes.reduce((modeIndex, presetMode, index) => mode === presetMode ? index : modeIndex, 0);
        }
    }

    public insert(index: number, items: T|T[]) {
        if (items instanceof Array) {
            this.items.splice(index, 0 , ...items);
        } else {
            this.items.splice(index, 0 , items);
        }

        if (this.length === 1) {
            this.active = index;
        }

        return this.length;
    }

    public goTo(index: number) {
        return this.active = index;
    }

    public previous() {
        if (this.active === null) {
            return null;
        }

        if (this.active > 0) {
            this.active--;
        } else {
            this.active = this.length - 1;
        }

        return this.active;
    }

    public next() {
        if (this.active === null) {
            return null;
        }

        switch (this.mode) {
            case "repeat":
            default:
                if (this.active < this.length - 1) {
                    this.active++;
                } else {
                    this.active = 0;
                }

                break;

            case "repeatOne":
                break;

            case "shuffle":
                this.active = Math.floor(Math.random() * this.length);

                break;
        }

        return this.active;
    }

    public switchMode() {
        this.modeIndex++;

        if (this.modeIndex >= modes.length) {
            this.modeIndex = 0;
        }

        return this.modeIndex;
    }
}
