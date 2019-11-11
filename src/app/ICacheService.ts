export default interface ICacheService {
    init(): Promise<void>;
    checkVersion(): Promise<void>;
    match(key: Request): Promise<Response|undefined>|undefined;
    put(key: Request, value: Response): void;
}
