import { NodeType, tokeType } from "../../tokenizer/token";
import ParseNode from "./node";

export default class LINE extends ParseNode {
    inline: any[];
    constructor(type: string, text: string) {
        super(type, text);
        this.inline = [];
    }

    addInline(inlineToken: any){
        this.inline.push(inlineToken);
    }
}; 