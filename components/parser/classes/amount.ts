import ParseNode from "./node";
import PROPOTIAL from "./propotial";
import QUANTITY from "./quantity";
import UNIT from "./units";

export default class AMOUNT extends  ParseNode{
    quantity :string;
    units?: string;
    constructor(type:string, raw:string, quantity: string, untis?:string){
        super(type,raw);
        this.quantity = quantity;
        this.units = untis;
    }

}