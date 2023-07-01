import PROPOTIAL from "./propotial";
import QUANTITY from "./quantity";
import UNIT from "./units";

export default class AMOUNT {
    type = "amount";
    units: UNIT | null;
    quantity: QUANTITY;
    prop: null | PROPOTIAL;

    constructor(units: UNIT | null, quantity: QUANTITY, prop: null | PROPOTIAL){
        this.units = units;
        this.quantity = quantity;
        this.prop = prop;
    }

}