export default class MARKDOWN {
    items : any[];
    type = "markdown";
    text = "markdown";
    
    constructor(){
        this.items = [];
    }

    addItem(item : any){
        this.items.push(item);
    }
}