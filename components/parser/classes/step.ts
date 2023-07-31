import { NodeType } from "../../tokenizer/token";
import LINE from "./line";
import ParseNode from "./node";

export default class STEP extends ParseNode{
    inline: any[];

    constructor(type: string, raw: string, inline: any[]){
        super(type,raw);
        this.inline = inline;
    }
}