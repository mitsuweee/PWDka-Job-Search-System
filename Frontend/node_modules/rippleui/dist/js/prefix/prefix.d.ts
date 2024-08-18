interface CssInJs {
    [key: string]: {
        [key: string]: string;
    };
}
export declare const getSelectorsWithPrefix: (prefix: string, cssInJs: CssInJs) => CssInJs;
export {};
