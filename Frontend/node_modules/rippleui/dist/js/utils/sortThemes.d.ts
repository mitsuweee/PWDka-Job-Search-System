export declare const sortThemes: <T extends {
    [key: string]: any;
}>(array: T[]) => (T | {
    ":root": any;
})[];
