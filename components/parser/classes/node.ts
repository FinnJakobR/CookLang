import { NodeType } from "../../tokenizer/token";
export default class ParseNode{
    type: NodeType;
    value: string;

    constructor(type: NodeType, value:string){
        this.type = type;
        this.value = value;
    }
}