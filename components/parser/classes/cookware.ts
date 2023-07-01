import WORD from "./word";

export default class COOKWARE {
    type = "cookware";
    name: WORD;

    constructor(name: WORD) {
        this.name = name;
    }
}