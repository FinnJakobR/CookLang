import ParseNode from "./node";

export default class LINK extends ParseNode{
    hypertext:string;
    link:string;
    constructor(type:string, raw:string, hypertext:string, link:string){
        super(type,raw);
        this.hypertext = hypertext;
        this.link = link;
    }
}