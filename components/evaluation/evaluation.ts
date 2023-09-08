import ParsingTree from "../parser/classes/tree";

export default class Evaluation {
    htmlString: String;

    constructor(){
        this.htmlString = "";
    }

    generateHTML(node:any): any{
        switch (node.type) {

            case "step":

                return `<div class="step">${node.inline.map((e:any,i:any)=>`${this.generateHTML(e)}`).join("")}</div>`;

                case "text":
                    return node.raw;

            case "underline":
                return `<u class="underline">${node.child.map((e:any,i:any)=> `${this.generateHTML(e)}`).join("")}</u>`

            case "ingredient":
                return `<span class="ingredient" ><span class="ingredient_amount" >${node.amount ? `<span class= "ingredient_amount_quantity">${node.amount.quantity}</span><span class="ingredient_amount_unit"> ${(node.amount.units)}</span>` : ""}</span><span class="ingredient_name"> ${node.name}</span></span>`


            case "bold":
                return `<b class="bold">${node.child.map((e:any,i:any)=> `${this.generateHTML(e)}`).join("")}</b>`

            case "url":
                return `<a class="url" href="${node.link}">${node.hypertext}</a>`;

            case "italic":
                return `<i class="italic">${node.child.map((e:any,i:any)=> `${this.generateHTML(e)}`).join("")}</i>`

            case "cookware":
                return `<span class="cookware"><span class="cookware_amount"> ${node.amount ? `<span class= "cookware_amount_quantity">${node.amount.quantity}</span><span class = "cookware_amount_unit"> ${(node.amount.units)}</span>` : ""}</span><span class="cookware_name"> ${node.name}</span></span>`

            case "timer":
                return `<span class="timer"><span class="timer_amount">${node.amount ? `<span class= "timer_amount_quantity">${node.amount.quantity}</span><span class = "timer_amount_unit"> ${(node.amount.units)}</span>` : ""}</span><span class="timer_name"> ${node.name}</span></span>`;

        default:
            console.log(node);
            throw Error("Evalutation Error");
                }

            }
    }
