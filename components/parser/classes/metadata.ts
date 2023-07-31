import ParseNode from "./node";


export default class METADATA extends ParseNode{
    option: string;
    value: string 

    constructor(option: string, value: string, type: string, raw: string){
        super(type, raw);
        this.option = option;
        this.value = value;
    }
}