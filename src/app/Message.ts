import IMessage from "./IMessage";

export default abstract class implements IMessage {
    protected static getMessageByCode(code: number, Message: object) {
        if (code === undefined || code === null) {
            return null;
        }

        for (const key in Message) {
            if (!Message.hasOwnProperty(key)) {
                continue;
            }

            const message = (Message as any)[key];

            if (message instanceof (Message as any) && message.code === code) {
                return message;
            }
        }

        return null;
    }

    public readonly code: number;
    public readonly text: string;

    protected constructor(code: number, text: string) {
        this.code = code;
        this.text = text;
    }
}
