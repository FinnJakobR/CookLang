import { Token, literal_tokens } from "../tokenizer/token";
import METADATA from "./classes/metadata";
import ParsingTree from "./classes/tree";
import STEP from "./classes/step";
import LINE from "./classes/line";
import { text } from "stream/consumers";
import TEXT from "./classes/text";
import WORD from "./classes/word";
import AMOUNT from "./classes/amount";
import INGREDIENT from "./classes/ingredients";
import COOKWARE from "./classes/cookware";
import TIMER from "./classes/timer";
import UNIT from "./classes/units";
import QUANTITY from "./classes/quantity";
import PROPOTIAL from "./classes/propotial";
import MARKDOWN from "./classes/markdown";
import BOLD from "./classes/bold";
import ITALIC from "./classes/italic";
import UNDERLNE from "./classes/underline";
import CSS, { CSS_PROP } from "./classes/css";
import LINK from "./classes/link";
import { url } from "inspector";

interface Chache {
    [char: string]: string;
}

export default class Parser {
    tokens: Token[];
    currentToken: Token | null;
    currentIndex: number;
    chache: Chache;
    tree: ParsingTree;

    constructor(){
        this.tokens = [];
        this.currentToken = null;
        this.currentIndex = 0;
        this.chache = {};
        this.tree = new ParsingTree();
    }

    nextToken(): void {
        this.currentIndex = this.currentIndex + 1;
        this.currentToken = this.tokens[this.currentIndex];
    }

    accept(tokenName: string): boolean{
        if (this.currentToken?.type === tokenName){
            this.nextToken();
            return true;
        };

        return false;
    }

    lookUpToken(index: number): Token {
        return this.tokens[this.currentIndex + index];
    }

    expect(tokenName: string): boolean {
        if(this.accept(tokenName)) return true;

        throw new Error("unexpected Token: " +  this.currentToken!.type + " at line: " + this.currentToken!.location.row + ", expected Token: " + tokenName );
    }

    except(tokenName: string): boolean {
        if(!this.accept(tokenName)) return true;

        throw new Error("unexpected Token: " + tokenName);
    }

    acceptAll(tokenName: string): boolean{
        return this.currentToken!.type.includes(tokenName);
    }

    //programm
    recipe(): ParsingTree {

        var tree = new ParsingTree();

        if(this.accept("TOKEN.META")){

            var newMeta = this.metaData();
            tree.addMetaData(newMeta);

            //es gibt entweder eine Meta oder ein Step

        }

        while(this.accept("TOKEN.META")){
                var newMeta = this.metaData();
                tree.addMetaData(newMeta);
        }


        var step = this.step();

        var i = 0

        while(step != null){
            tree.addStep(step);
            step = this.step();
            i++;

        }

        return tree;

    }

    metaData(){

        this.except("TOKEN.NEWLINE");
        this.except("TOKEN.DOUBLEPOINT");

        var title: string = this.currentToken!.text;

        this.nextToken();


        //Title -----------------------------------

        while(!(this.accept("TOKEN.DOUBLEPOINT"))){
            
            this.except("TOKEN.NEWLINE");
            this.except("TOKEN.END");

            title+= this.currentToken!.text;
            this.nextToken();
        }
        
        
         //Title -----------------------------------

         //Data ------------------------------------

         this.except("TOKEN.END");
         this.except("TOKEN.NEWLINE");



         
         var data = [this.inline()];
        

         while(!this.accept("TOKEN.NEWLINE") && !this.accept("TOKEN.END")){
            data.push(this.inline());
         }

          //Data ------------------------------------

         this.chopLine();

         return new METADATA(data, ">>", title);

    }

    chopLine(){
        while(this.accept("TOKEN.NEWLINE"));
    }

    step(): STEP | null{

        if(!this.currentToken) return null;

        var line = this.line();

        var step = new STEP("\n", "step")

        if(!line) throw Error("Provide at least one Inline Token");

        step.addSteps(line);

        while(this.accept("TOKEN.NEWLINE")){

            if(this.accept("TOKEN.NEWLINE")) break;
             line = this.line();
            step.addSteps(line);
        }

        this.chopLine();

        if(step.step.length == 0) return null;

        return step;
    }

    line():LINE{
        var line = new LINE("line", "line");
        this.except("TOKEN.NEWLINE");

        var inlineToken = this.inline();

        line.addInline(inlineToken);

        while(this.currentToken!.type != "TOKEN.NEWLINE" && !this.accept("TOKEN.END")){

            inlineToken = this.inline();
            line.addInline(inlineToken);
        }

        return line;

    };

    inline(){
        if(this.accept("TOKEN.AT")){
            var f = this.ingredient();
            return f;
        } else if(this.accept("TOKEN.HASH")){
            return this.cookware();
        }else if(this.accept("TOKEN.TILE")){
            return this.timer();
        }else if(this.accept("TOKEN.URL")){
            return this.link();
        }else{
            return this.markdown();

        }
    };

    ingredient(){
        var name: WORD = this.word();

        return new INGREDIENT(name);
    }
    //***HALLO**

    //*HALLO**

    //1 u. 1  = ITALIC
    //1 u. 2 = ITALIC + TEXT 
    //2 u. 1 = TEXT + ITALIC
    //2 u. 2 = BOLD
    //3 u. 2 = TEXT BOLD ist 

    //6 u. 6 = *******TEXT******
    
    

    //

    markdown(): MARKDOWN | TEXT{
        console.log(this.currentToken);
        if(this.accept("TOKEN.MULTI")){
            return this.boldItalic("TOKEN.MULTI", "*");
        } else if(this.accept("TOKEN.UNDERLINE")){
            return this.boldItalic("TOKEN.UNDERLINE", "_");
        } else if(this.accept("TOKEN.ADD")){
            return this.underline("TOKEN.ADD", "+");
        }else if(this.accept("TOKEN.CODE")){
            return this.css("TOKEN.CODE", "`");
        }else{
            var t = this.currentToken!.text;
            this.nextToken();
            return new TEXT("text", t ?? "");
        }
    }




    cookware(){
        var name: WORD = this.word();
        return new COOKWARE(name);
    }

    timer(){
        this.except("TOKEN.NEWLINE");
        this.except("TOKEN.END");

        if(this.accept("TOKEN.CURLYOPAREN")){
            var amount = this.amount();
            var name = new WORD("", amount);
            return new TIMER(name);
        }

        var name: WORD = this.word();

        return new TIMER(name);
    }

    word(): WORD{
        this.except("TOKEN.NEWLINE");
        this.except("TOKEN.END");
        this.except("TOKEN.CURLYOPAREN");
        this.except("TOKEN.WHITESPACE");

        var name = this.currentToken!.text;
        var chachedName = "";
        var amount = null; 
        var i = 0;

        this.nextToken();

        while(this.lookUpToken(i)!.type != "TOKEN.NEWLINE" && this.lookUpToken(i)!.type != "TOKEN.END"){
            if(this.lookUpToken(i)!.type == "TOKEN.CURLYOPAREN"){
                
                while(i >= 0 ){
                    this.nextToken();
                    i--;
                }
                amount = this.amount();
                name += chachedName;
                this.accept("TOKEN.CURLYCPAREN");
                break;
            }
            chachedName += this.lookUpToken(i)!.text;
            i++;
        }


        return new WORD(name, amount);

    }

    amount(): AMOUNT | null{
       
        if(this.currentToken!.type == "TOKEN.CURLYCPAREN") return null;

       var quantity =  this.quantity();
       var units = null;
       this.nextToken();
       var propotial = null;

       if(this.accept("TOKEN.MULTI")){

        propotial = new PROPOTIAL("1");

        if(this.accept("TOKEN.NUMBER")){
            propotial.value = this.lookUpToken(-1)!.text;
        }
       }

       if(this.accept("TOKEN.PROCENT")){
        units = this.units();
       }

       return new AMOUNT(units, quantity, propotial);

    }

    quantity(): QUANTITY{
        this.except("TOKEN.NEWLINE");
        this.except("TOKEN.END");
        this.except("TOKEN.PROCENT");
        this.except("TOKEN.CURLYCPAREN");
        return new QUANTITY(this.currentToken!.text);
    }

    units(): UNIT{
        this.except("TOKEN.NEWLINE");
        this.except("TOKEN.END");
        this.except("TOKEN.CURLYCPAREN");
        var units = this.currentToken!.text;
        this.nextToken();

        while(!this.accept("TOKEN.NEWLINE") && !this.accept("TOKEN.END") && !this.accept("TOKEN.CURLYCPAREN")){
            units += this.currentToken!.text;
            this.nextToken();
        }

        return new UNIT(units);
    }

    boldItalic(TOKEN:string, t:string):MARKDOWN{
        var mark = new MARKDOWN();
        var childs = [];
        var left = 1;
        var right = 0;

        while(this.currentToken!.type == TOKEN && (left != 2)){ 
            left++;
            this.nextToken();
        };

        var isLeftBold = left == 2;

        childs.push(this.markdown());

        while(!this.accept(TOKEN)){
            if(this.currentToken!.type == ("TOKEN.NEWLINE") || this.currentToken!.type == ("TOKEN.END")){

                while(left > 0){
                    childs.unshift(new TEXT("text", t));
                    left --; 
                }

                mark.items = childs;

                return mark;
            }  
            childs.push(this.markdown());
        }

        right = 1;

        while(this.currentToken!.type == TOKEN && (right != left)) {
            right ++
            this.nextToken();
        } ;


        var isRightBold = right == 2;

        if(isRightBold && isLeftBold){
            mark.addItem(new BOLD(childs));
        }else if(!isRightBold && isLeftBold){
            mark.addItem(new TEXT("text", t));
            mark.addItem(new ITALIC(childs));
        }else if(isRightBold && !isLeftBold){
            mark.addItem(new ITALIC(childs));
            mark.addItem(new TEXT("text", t));
        }else if(!isRightBold && !isLeftBold){
            mark.addItem(new ITALIC(childs));
        }

        
        
        return mark;
    }

    underline(TOKEN: string, t: string): MARKDOWN{
        var mark = new MARKDOWN();

        var childs = [this.markdown()];



        while(!this.accept(TOKEN)){

            if(this.currentToken!.type == ("TOKEN.NEWLINE") || this.currentToken!.type == ("TOKEN.END")){
                    childs.unshift(new TEXT("text", t));

                mark.items = childs;

                return mark;
            }  

            childs.push(this.markdown());
        }

        mark.addItem(new UNDERLNE(childs));


        return mark;
    }

    css(TOKEN:string, t:string): MARKDOWN{
        var mark = new MARKDOWN();

        var childs = [this.markdown()];

        var props = null;

        while(!this.accept(TOKEN)){

            if(this.currentToken!.type == ("TOKEN.NEWLINE") || this.currentToken!.type == ("TOKEN.END")){
                childs.unshift(new TEXT("text", t));

            mark.items = childs;

            return mark;
        }  
            childs.push(this.markdown());
        }

        if(this.accept("TOKEN.OBRACKET")){
            props = this.cssProps();
           this.expect("TOKEN.CBRACKET");
       }

       mark.addItem(new CSS(props ?? [], childs))

        return mark;
    }

    link(){
        this.expect("TOKEN.OPAREN");
        var url = "";


        while(!this.accept("TOKEN.CPAREN")){
            url += this.currentToken!.text;
            this.nextToken();
        }

        return new LINK([],url);
    }


    cssProps(): CSS_PROP[]{
        var props: CSS_PROP[] = [];

        this.except("TOKEN.CURLYOPAREN");
        this.except("TOKEN.NEWLINE");
        var value = this.currentToken!.text;
        this.nextToken();
        
        if(!this.accept("TOKEN.EQUAL") && !this.accept("TOKEN.DOUBLEPOINT")){
          this.throwError();
        }

        this.except("TOKEN.CURLYOPAREN");
        this.except("TOKEN.NEWLINE");

        while(this.accept("TOKEN.WHITESPACE"));

        var prop = this.currentToken!.text;

        this.nextToken();

        props.push(new CSS_PROP(value, prop));

        while(this.accept("TOKEN.WHITESPACE"));

        while(this.accept("TOKEN.COMMA")){
            this.except("TOKEN.CURLYOPAREN");
            this.except("TOKEN.NEWLINE");
            var value = this.currentToken!.text;
            this.nextToken();
            
            if(!this.accept("TOKEN.EQUAL") && !this.accept("TOKEN.DOUBLEPOINT")){
              this.throwError();
            }

            this.except("TOKEN.CURLYOPAREN");
            this.except("TOKEN.NEWLINE");

            var prop = this.currentToken!.text;

            this.nextToken();

            props.push(new CSS_PROP(value, prop));

        }

        return props;
    }

    throwError(MESSAGE: string = "PARSING ERROR"){
        throw new Error(MESSAGE + ` at line ${this.currentToken!.location.col + 1}, at symbol ${this.currentToken!.location.row}`);
    }

    parse(tokens: Token[]){
        this.tokens = tokens;
        this.currentToken = this.tokens[0];
        return this.recipe();
    }

}