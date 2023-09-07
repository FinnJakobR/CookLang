import ParsingTree from "../parser/classes/tree";

export default class Evaluation {
    htmlString: String;

    constructor(){
        this.htmlString = "";
    }

    generateHTML(node:any): any{
        switch (node.type) {
            case "step":
                
                return `${node.inline.map((e:any,i:any)=>`${this.generateHTML(e)}`).join("")}<br></br>`;

                case "text": 
                    return node.raw;
    
            case "underline":
                return `<u>${node.child.map((e:any,i:any)=> `${this.generateHTML(e)}`).join("")}</u>`
    
            case "ingredient":
                return `<span><b>${node.name}</b><i>${node.amount ? node.amount.quantity: ""}</i></span>`
    
    
            case "bold":
                return `<b>${node.child.map((e:any,i:any)=> `${this.generateHTML(e)}`).join("")}</b>`
    
            case "url":
                return `<a href="${node.link}">${node.hypertext}</a>`;

            case "ITALIC":
                return `<i>${node.child.map((e:any,i:any)=> `${this.generateHTML(e)}`).join("")}</i>`
    
            case "cookware":
                return `<span>COOKWARE: <b>${node.name}</b><i>${node.amount ? node.amount.quantity: ""}</i></span>`
    
            case "timer":
                return `<span>TIMER: <b>${node.name}</b><i>${node.amount ? node.amount.quantity: ""}</i></span>`;
    
        default:
            console.log(node);
            throw Error("Evalutation Error");
                }

            }
    }
