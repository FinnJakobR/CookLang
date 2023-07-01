import AMOUNT from "./amount";

export default class WORD {
    word: string;
    amount: AMOUNT | null;
    type = "word";

    constructor(word: string, amount: AMOUNT | null){
        this.word = word;
        this.amount = amount;
    }
}