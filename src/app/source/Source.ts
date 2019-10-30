/**
 * Created by qhyang on 2017/12/12.
 */

import Set from "../Set";
import TrackList from "./TrackList";

export default class Source extends Set<TrackList> {

    public readonly id: string;
    public readonly icons: string[];
    public active: boolean;
    public priority: number;

    constructor(id: string, { name, icons }: { name?: string, icons?: string[] } = {}) {
        super({ name });

        this.id = id;
        this.icons = icons || [];
        this.active = false;
        this.priority = 1;
    }
}
