type WidthConfig = {
    [propName: string]: number;
}

type OptionConfig = {
    text: string;
    icon?: string;
    width?: WidthConfig;
    moreAction?: boolean;
    callback?: () => void;
}

type GroupConfig = OptionConfig[];
type ContextMenuConfig = GroupConfig[];

export default ContextMenuConfig;
