import fg from "fast-glob";
import {GlobbyType} from "../main";

export function makeMockGlob(values: Array<string>): GlobbyType {
    return function(pattern: string | string[], options: fg.Options | undefined) {
        return Promise.resolve(values);
    }
}
