import { NodeType } from "../../tokenizer/token";
import LINE from "./line";
import ParseNode from "./node";

export default class STEP extends ParseNode{
    step: LINE[];

    constructor(type: NodeType, value: string){
        super(type,value);
        this.step = [];
    }

    addSteps(steps: LINE): void{
     this.step.push(steps);
    }
}