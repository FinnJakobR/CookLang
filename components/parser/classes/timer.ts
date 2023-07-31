import AMOUNT from "./amount";
import ParseNode from "./node";



export default class TIMER extends ParseNode {
    name: string;
    amount?: AMOUNT| null;

    constructor(type:string, raw:string, name:string, amount?: AMOUNT | null){
        super(type,raw);
        this.name = name;
        this.amount = amount;
    }

}