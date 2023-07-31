import AMOUNT from "./amount";
import ParseNode from "./node";
import WORD from "./word";

export default class INGREDIENT extends ParseNode {
    name:string;
    amount?:AMOUNT | null;

    constructor(type:string, raw:string, name:string, amount?:AMOUNT | null){
        super(type,raw);
        this.name = name;
        this.amount = amount;
    }
}