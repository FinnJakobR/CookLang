import ParseNode from "./node";


export default class METADATA extends ParseNode{
    data: any; 

    constructor(data: any, type: string, text: string){
        super(type, text);
        this.data = data;
    }
}