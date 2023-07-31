import ParseNode from "./node";

export default class TEXT extends ParseNode {
    text:string;

    constructor(type:string, raw:string, text:string){
        super(type,raw);
        this.text = text;
    }
}