import { ColorsMap, RecursivePartial } from "../types/theme.types";
type Result = `${number} ${number} ${number}`;
export declare const hexToRGB: (hex: string) => Result;
export declare const palleteToRGB: <T extends ColorsMap | RecursivePartial<ColorsMap>>(pallete?: T) => T;
export {};
