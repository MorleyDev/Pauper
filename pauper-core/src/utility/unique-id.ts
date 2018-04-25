import { utility } from "../engine/engine";

let prevId = 0;

export const uniqueId = utility.available ? utility.unique : () => prevId++;
