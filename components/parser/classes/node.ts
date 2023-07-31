import { NodeType } from "../../tokenizer/token";
export default class ParseNode{
    type: string;
    raw: string;

    constructor(type: string, value:string){
        this.type = type;
        this.raw = value;
    }
}