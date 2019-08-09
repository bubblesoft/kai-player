export default class Status {
    public static Ok = new Status(0);
    public static Warning = new Status(1);
    public static Error = new Status(2);

    public static fromId(id: number) {
        if (id === undefined || id === null) {
            return null;
        }

        for (const key in Status) {
            if (!Status.hasOwnProperty(key)) {
                continue;
            }

            const status = (Status as any)[key];

            if (status instanceof Status && status.id === id) {
                return status;
            }
        }

        return null;
    }

    public id: number;

    private constructor(id: number) {
        this.id = id;
    }
}
