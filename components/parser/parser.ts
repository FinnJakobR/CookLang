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

        this.nextToken();

        while(this.currentToken!.type != "TOKEN.NEWLINE" && this.currentToken!.type != "TOKEN.END"){
            if(this.accept("TOKEN.CURLYOPAREN")){
                amount = this.amount();
                name += chachedName;
                this.accept("TOKEN.CURLYCPAREN");
                break;
            }
            chachedName += this.currentToken!.text;
            this.nextToken();
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
        var left = 1;
        var right = 0;

        while(this.accept(TOKEN)) left ++;

        var child = this.markdown();

        while(this.accept(TOKEN)) right ++;

        if(left == right){

            if(left > 3){
                // BOLD(ITALIC)

                var i = 3;

                while(i != left){
                    mark.addItem(new TEXT("text", t));
                    i++;
                };

                var ii = 3;


                mark.addItem(new BOLD(new ITALIC(child)));

                while(ii != right){
                    mark.addItem(new TEXT("text", t));
                    ii++;
                }


            } 

            if(left == 2){
                mark.addItem(new BOLD(child));
            }

            if(left == 1) {
               mark.addItem(new ITALIC(child));
            }
        }

        if(left > right){
            
            while(left != right){
                mark.addItem(new TEXT("text", t))
                left --;
            }

            if(right > 3){
                // BOLD(ITALIC)

                var i = 3;

                while(i != left){
                    mark.addItem(new TEXT("text", t));
                    i++;
                };

                var ii = 3;


                mark.addItem(new BOLD(new ITALIC(child)));

                while(ii != right){
                    mark.addItem(new TEXT("text", t));
                    ii++;
                }


            } 

            if(right == 2){
                mark.addItem(new BOLD(child));
            }

            if(right == 1) {
               mark.addItem(new ITALIC(child));
            }
        }

        if(left < right){
            var diff = right - left;

            if(left > 3){
                // BOLD(ITALIC)

                var i = 3;

                while(i != left){
                    mark.addItem(new TEXT("text", "*"));
                    i++;
                };

                var ii = 3;


                mark.addItem(new BOLD(new ITALIC(child)));

                while(ii != right){
                    mark.addItem(new TEXT("text", "*"));
                    ii++;
                }


            } 

            if(left == 2){
                mark.addItem(new BOLD(child));
            }

            if(left == 1) {
               mark.addItem(new ITALIC(child));
            }

            for (let i = 0; i < diff; i++) {
                mark.addItem(new TEXT("text", "*"));
            }
        }

        return mark;
    }

    underline(TOKEN: string, t: string): MARKDOWN{
        var mark = new MARKDOWN();
        var left = 1;
        var right = 0;
        var childs = [];

        while(this.accept(TOKEN)) left++;

        var diff_left = left - 1;

        childs.push(this.markdown());


        while(!this.accept(TOKEN)){
            if(this.currentToken!.type == ("TOKEN.NEWLINE") || this.currentToken!.type == ("TOKEN.END")){
                
                for (let d_l = 0; d_l < left; d_l++) {
                    mark.addItem(new TEXT("text", t));
                }

                for (let childs_index = 0; childs_index < childs.length; childs_index++) {
                    mark.addItem(childs[childs_index]);
                }

                return mark;
            }  

            childs.push(this.markdown());
        }

        right = 1;

        while(this.accept(TOKEN)) right ++;


        for (let d_l = 0; d_l < diff_left; d_l++) {
            mark.addItem(new TEXT("text", t))
        }

        var child = new MARKDOWN();
        
        child.items = childs;

        if(right > 0){
            mark.addItem(new UNDERLNE(child));

            var diff_right = right -1;

            for (let d_r = 0; d_r < diff_right; d_r++) {
                
                mark.addItem(new TEXT("text",t));
                
            }
        }

        return mark;
    }

    css(TOKEN:string, t:string): MARKDOWN{
        var mark = new MARKDOWN();
        var left = 1;
        var right = 0;

        var props = null;

        while(this.accept(TOKEN)) left++;

        var child = this.markdown();

        while(this.accept(TOKEN)) right++;

        if(this.accept("TOKEN.CURLYOPAREN")){
             props = this.cssProps();
            this.expect("TOKEN.CURLYCPAREN");
        }

        var diff_left = left  - 1;

        for (let d_l = 0; d_l < diff_left; d_l++) {

            mark.addItem(new TEXT("text", t));
            
        }


        if(right > 0){
            var css = new CSS(props ?? [])

            css.addChild(child);

            mark.addItem(css);

            var diff_right = right -1;


        for (let d_r = 0; d_r < diff_right; d_r++) {
            mark.addItem(new TEXT("text", t));
            
        }
    }
        return mark;
    }

    link(){
        var mark = new MARKDOWN();
        if(!this.accept("TOKEN.OBRACKET")) {
            return new TEXT("text", "!");
        };




        
        
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

        var prop = this.currentToken!.text;

        this.nextToken();

        props.push(new CSS_PROP(value, prop));

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

        console.log(this.currentToken);
        console.log(props);

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