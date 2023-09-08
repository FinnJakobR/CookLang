import ParsingTree from "./classes/tree";
import { Token, literal_tokens } from "../tokenizer/token";
import TEXT from "./classes/text";
import METADATA from "./classes/metadata";
import STEP from "./classes/step";
import INGREDIENT from "./classes/ingredients";
import AMOUNT from "./classes/amount";
import MARKDOWN from "./classes/markdown";
import COOKWARE from "./classes/cookware";
import TIMER from "./classes/timer";
import UNDERLNE from "./classes/underline";
import LINK from "./classes/link";
import BOLD from "./classes/bold";
import ITALIC from "./classes/italic";

interface Run {
    run:    string;
    child: any[];
  }




export default class Parser {
    tokens: Token[];
    currentToken: Token | null;
    currentIndex: number;
    tree: ParsingTree;
    currentEndIndex: number;
    currentLevel: number;
    ingredients: INGREDIENT[];
    courses: string[];
    tags: string[];
    timeInMs: number;

    constructor(){
        this.tokens = [];
        this.currentToken = null;
        this.currentIndex = 0;
        this.tree = new ParsingTree();
        this.currentEndIndex = Infinity;
        this.currentLevel = -1;
        this.ingredients = [];
        this.courses = [];
        this.tags = [];
        this.timeInMs = 0;
    }
    
    nextToken(index?:number): void  {
       index ?  (this.currentIndex += index) : this.currentIndex += 1;
        this.currentToken = this.tokens[this.currentIndex];
    }

    beforeToken(): void {
        this.currentIndex -= 1;
        this.currentToken = this.tokens[this.currentIndex];
    }

    lookUpToken(index:number):Token{
        return this.tokens[this.currentIndex + index];
    }

    accept(tokenName:string):boolean{
        
        if(this.currentToken!.type === tokenName) return true;
        
        return false;
    }

    expect(tokenName:string): boolean | TEXT{
        if(this.accept(tokenName)) return true;

        var t = this.currentToken!.text;

        this.nextToken();

        return new TEXT("text",t,t);
    }

    isEnd():boolean{
        
        if(this.currentIndex == this.tokens.length - 1) return true;

        else return false;
    }

    chopLine():void{
        while(this.accept("TOKEN.NEWLINE")) this.nextToken();
    }

    recipe():ParsingTree{

        while(!this.isEnd()){
            if(this.isMetaData()){
                this.nextToken();
                var meta = this.metaData();

                if(meta) this.tree.addMetaData(meta);
                else {
                    this.beforeToken();
                    var step = this.step();
                    this.tree.addStep(step);
                }
                this.chopLine();
            }else{
                var step = this.step();
                this.tree.addStep(step);
                this.chopLine();
            }
        }

        return this.tree;
    }

    lookUntil(tokenName:string, startIndex = 0, types: string[] = []): boolean{
        var lookUpIndex = startIndex;
        while(this.lookUpToken(lookUpIndex)!.type !== tokenName){
            if((this.lookUpToken(lookUpIndex)!.type === "TOKEN.NEWLINE") || this.lookUpToken(lookUpIndex)!.type === "TOKEN.END" || types.includes(this.lookUpToken(lookUpIndex)!.type)) return false;
            lookUpIndex++;
        }
        return true;
    }

    isMetaData():boolean{
    
        return this.accept("TOKEN.META") && this.lookUntil("TOKEN.DOUBLEPOINT")
    }

    metaData():METADATA | null {

        
        var option = "";
        var data = "";

        var hasDoublePoint = this.lookUntil("TOKEN.DOUBLEPOINT");

        if(!hasDoublePoint) return null;

        while(!this.accept("TOKEN.DOUBLEPOINT")){
            option+=this.currentToken!.text;
            this.nextToken();
        }

        this.nextToken();

        while(!this.accept("TOKEN.NEWLINE") && !this.isEnd()){
            data+=this.currentToken!.text;
            this.nextToken();
        }


        if(option.toLowerCase().trim() == "course"){

            this.courses = data.trim().split(/<>/g).map((e,i)=>e.replaceAll(" ", ""));
        }

        if(option.toLowerCase().trim() == "tags"){
            this.tags = data.trim().split(/,|\|/g).map((e,i)=>e.replaceAll(" ", ""));
        }



        return new METADATA(option.trim(),data.trim(),"meta",`>>${option}:${data}`);
    }

    step() : STEP{
        var inline: any[] = [];

        while(!(this.accept("TOKEN.NEWLINE") && this.lookUpToken(1)!.type === "TOKEN.NEWLINE") && !this.isEnd()){
            var inlineTokens = this.inline();
            inline.push(inlineTokens);
        }

        return new STEP("step", "", inline);
    }

    inline(){
        if(this.isIngredient()){
            var ingredient = this.ingredient();
            return ingredient;
        }else if (this.isCookWare()){
            var cookware = this.cookware();
            return cookware;
        }else if(this.isTimer()){
            var timer = this.timer();
            return timer;
        }else if(this.isBoldItalic()){
            var boldItalic = this.boldItalic();
            return boldItalic;
        }else if(this.isUrl()){
            var url = this.url();
            return url;
        }else if(this.isUnderline()){
            var underline = this.underline()
            return underline;
        }else{
            var t = this.currentToken!.text;
            this.nextToken();
            return new TEXT("text",t,t);
        }
    }

    isIngredient(){
        return this.accept("TOKEN.AT") && this.lookUpToken(1).type != "TOKEN.WHITESPACE";
    }

    isCookWare(){
        return this.accept("TOKEN.HASH") && this.lookUpToken(1).type != "TOKEN.WHITESPACE";
    }

    isTimer(){
        return this.accept("TOKEN.TILE") && this.lookUntil("TOKEN.CURLYOPAREN");
    }

    isBoldItalic(){
        return ((this.accept("TOKEN.MULTI") || this.accept("TOKEN.UNDERLINE")));
    }

    isUrl(){
        return this.accept("TOKEN.OBRACKET") && this.lookUntil("TOKEN.CBRACKET") && this.lookUntil("TOKEN.OPAREN") && this.lookUntil("TOKEN.CPAREN");
    }

    isUnderline(){
        return this.accept("TOKEN.ADD") && this.lookUntil("TOKEN.ADD",1);
    }

    ingredient(){
        this.nextToken();
        var word = this.word();
        var amount = null;

        var hasAmount = (this.accept("TOKEN.CURLYOPAREN") && this.lookUntil("TOKEN.CURLYCPAREN"));

        if(hasAmount) amount = this.amount();

        this.ingredients.push(new INGREDIENT("ingredient","",word,amount));

        return new INGREDIENT("ingredient","",word,amount)
    }

    cookware(){
        this.nextToken();
        var word = this.word();
        var amount = null;

        var hasAmount = (this.accept("TOKEN.CURLYOPAREN") && this.lookUntil("TOKEN.CURLYCPAREN"));

        if(hasAmount) amount = this.amount();

        return new COOKWARE("cookware","",word,amount)
    }

    timer(){
        this.nextToken();
        var noName = this.accept("TOKEN.CURLYOPAREN");

        if(noName){
            var amount = this.amount();
            return new TIMER("timer","","",amount);
        }

        var name = this.word();
        var amount = this.amount();
        return new TIMER("timer","",name,amount);
    }

    underline(): UNDERLNE{
        this.nextToken();
        var childTokens = [];
        
        while(!this.accept("TOKEN.ADD")){
            childTokens.push(this.inline());
        }
        this.nextToken();

        return new UNDERLNE(childTokens);

    }

    boldItalic() : any{
        var emToken = this.currentToken!;

        var l = (this.currentLevel+=1);
        
        this.nextToken();

        var left_delimiter = this.accept(emToken.type) ? emToken.text.repeat(2) : emToken.text;
        var isBold = left_delimiter.length == 2;

        if(isBold) this.nextToken();

        var endIndex = this.currentIndex;
        var startIndex = this.currentIndex;

        this.delimiter_run(emToken.type);

        var right_delimiter;

        var lastRun = "";

        while((!right_delimiter && !this.isNewLine())){
            
            var run = "";

            while(this.accept(emToken.type)){
                run+=this.currentToken!.text;
                lastRun = run;
                endIndex = this.currentIndex;
                
                if(endIndex >= this.currentEndIndex) {
                    break;
                
                };
                this.nextToken();
            }

            this.nextToken();

            right_delimiter = (run.length >= 2 && left_delimiter.length >= 2) || (run.length == 1 && left_delimiter.length == 1);


        }

        var childs = [];

        //**dadsad*

        endIndex = endIndex - (left_delimiter.length);

        this.currentEndIndex = endIndex;

        this.currentIndex = startIndex;

        this.currentToken = this.tokens[this.currentIndex];

        //**adc*c*s



        while(this.currentIndex <= endIndex){
            childs.push(this.inline());
        }



        this.currentIndex = endIndex + (left_delimiter.length + 1);

        this.currentToken = this.tokens[this.currentIndex];

        if(l == 0){
            this.currentLevel = 0;
            this.currentEndIndex = Infinity;
        }

        return isBold ? new BOLD(childs) : new ITALIC(childs);

        }


  delimiter_run(tokenName:string){
        var count = 0;
        
        while(this.accept(tokenName)){
            count++;
            this.nextToken();
        }

        return count;

    }

    isNewLine(){
        return this.accept("TOKEN.NEWLINE") || this.isEnd();
    }

    isRightRun(delimiters: Run[], currentRun: string){
        for (let i = 0; i < delimiters.length; i++) {
            if(delimiters[i].run === currentRun) return i;
            
        }

        return -1;
    }

    url(){
        this.nextToken();

        var linkName = "";

        while(!this.accept("TOKEN.CBRACKET")){
            linkName+=this.currentToken!.text;
            this.nextToken();
        }

        this.nextToken();
        this.nextToken();

        var link = "";

        while(!this.accept("TOKEN.CPAREN")){
            link+=this.currentToken!.text;
            this.nextToken();
        }
        
        this.nextToken();

        return new LINK("url",`[${linkName}](${link})`,linkName,link);
    }

    word(){
        var word = "";
        var isMultiWord = (this.lookUntil("TOKEN.CURLYOPAREN",0,["TOKEN.AT","TOKEN.HASH", "TOKEN.TILE"]) && this.lookUntil("TOKEN.CURLYCPAREN",0,["TOKEN.AT","TOKEN.HASH", "TOKEN.TILE"]));

        if(isMultiWord){
            
            while(!this.accept("TOKEN.CURLYOPAREN")){
                word+= this.currentToken!.text;
                this.nextToken();
            }

            return word;
        }
            word = this.currentToken!.text;
            this.nextToken();
            return word;
    }
    
    amount(): AMOUNT{
        this.nextToken();
        
        var units = "";
        var quantity = "";

        var hasUnits = (this.lookUntil("TOKEN.PROCENT",0,["TOKEN.CURLYCPAREN"]));

        if(hasUnits){
            
            while(!this.accept("TOKEN.PROCENT")){
                quantity+=this.currentToken!.text;        
                this.nextToken();
            }
            this.nextToken(); //->%->

            while(!this.accept("TOKEN.CURLYCPAREN")){
                units+= this.currentToken!.text;
                this.nextToken();
            }

            this.nextToken() //->}->

            return new AMOUNT("amount", "", quantity, units);
        }

        while(!this.accept("TOKEN.CURLYCPAREN")){
            quantity+= this.currentToken!.text;
            this.nextToken();
        }

        this.nextToken() //->}->

        return new AMOUNT("amount","",quantity,units);

    }



    parse(tokens: Token[]){
        this.tokens = tokens;
        this.currentToken = this.tokens[0];
        return this.recipe();
    }
}