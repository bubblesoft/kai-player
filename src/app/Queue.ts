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
            this.activeIndex = index;
        }

        return this.length;
    }

    public goTo(index: number) {
        return this.activeIndex = index;
    }

    public previous() {
        if (this.activeIndex === null) {
            return null;
        }

        if (this.activeIndex > 0) {
            this.activeIndex--;
        } else {
            this.activeIndex = this.length - 1;
        }

        return this.activeIndex;
    }

    public next() {
        if (this.activeIndex === null) {
            return null;
        }

        switch (this.mode) {
            case "repeat":
            default:
                if (this.activeIndex < this.length - 1) {
                    this.activeIndex++;
                } else {
                    this.activeIndex = 0;
                }

                break;

            case "repeatOne":
                break;

            case "shuffle":
                this.activeIndex = Math.floor(Math.random() * this.length);

                break;
        }

        return this.activeIndex;
    }

    public switchMode() {
        this.modeIndex++;

        if (this.modeIndex >= modes.length) {
            this.modeIndex = 0;
        }

        return this.modeIndex;
    }
}
