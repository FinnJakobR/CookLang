import WORD from "./word";

export default class INGREDIENT {
    type = "ingredient";
    name: WORD;

    constructor(name: WORD) {
        this.name = name;
    }
}