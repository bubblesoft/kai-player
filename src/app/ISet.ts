export default interface ISet<T> {
    name?: string;
    length: number;
    activeIndex: number|null;
    load(items: T|T[]): number;
    add(items: T|T[]): number;
    get(index: number|null|undefined): T|T[];
}
