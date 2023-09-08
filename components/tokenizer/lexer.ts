import { Token, keywords, literal_tokens } from "./token";
import Location from "../location";

export class Lexer {
    source: string;
    cursor: number;
    currentLineIndex: number;
    row: number;
    file_path: string;

    constructor(source: string, file_path: string){
        this.source = source;
        this.cursor = 0;
        this.currentLineIndex = 0;
        this.row = 0;
        this.file_path = file_path;
    }

    is_not_empty(): boolean{
        return this.cursor < this.source.length;
    }

    isspace(char: string): boolean{
        return char != undefined &&  char.replace(/ +$/, '').length == 0;
    } 

    chop_char(): void{
        if(this.is_not_empty()){
            var currentChar: string = this.source[this.cursor];
            this.cursor = this.cursor + 1;
            if(currentChar.match(/\n|\r/)){
                this.currentLineIndex = this.cursor;
                this.row = this.row + 1;
            }
        }
    }

    alpha(str: string): boolean {
        //umbauen maybe so, dass alles was nicht erkannt wird text ist. 
        return (/^[a-zA-Z\u00C0-\u024F\u0027\u1E00-\u1EFF\u2018-\u201F!>]+$/i.test(str)) && str != undefined ; //&& str 
    }

    is_numeric(str: string): boolean {
        return /^\d+$/.test(str) || str == "." || str == ",";
    }

    alnum(str: string): boolean {
        var i, len;
          
        for (i = 0, len = str.length; i < len; i++) {
          if (!(this.alpha(str[i].toLowerCase())) &&
              !(this.is_numeric(str[i]))
              ) { // lower alpha (a-z)
            return false;
          }
        }
        return true;
    }

    trim_left(): void {
        while(this.is_not_empty() && this.isspace(this.source[this.cursor])){
            this.chop_char();
        }
    }

    starts_with(str: string, char: string): boolean{
        return str.startsWith(char);
    }

    drop_line():void {
        while(this.is_not_empty() && !(this.source[this.cursor].match(/\n|\r/))){
            this.chop_char();
        }

        if(this.is_not_empty()){
            this.chop_char();
        }
    }

    chop_comments(): void{
        while(this.is_not_empty()){
            var s: string = this.source.substring(this.cursor);
            if(!this.starts_with(s,"->")) break;
            this.drop_line();
            this.trim_left();

        }

    }

    nextToken(): Token | false  {
        this.chop_comments();

        const loc: Location = new Location(this.file_path,this.row, this.cursor - this.currentLineIndex);
        const first_char:string = this.source[this.cursor];

        if(this.isspace(first_char)) {
            this.chop_char();
            return new Token("TOKEN.WHITESPACE", " ", loc);
        }

        if(this.alpha(first_char)){
            var index : number = this.cursor;

            while(this.is_not_empty() && this.alnum(this.source[this.cursor])){
                this.chop_char();
            }
            
            var text: string = this.source.substring(index, this.cursor);

            if(keywords[text.toLowerCase()]) return  new Token(keywords[text.toLowerCase()], text, loc);

            return new Token("TOKEN.WORD", text, loc);
        }

        if(literal_tokens[first_char]) {
            this.chop_char();
            return new Token(literal_tokens[first_char], first_char, loc);
        }

        if(this.is_numeric(first_char)){
            var start:number = this.cursor;

            while(this.is_not_empty() && this.is_numeric(this.source[this.cursor])){
                this.chop_char();
            }

            const value = this.source.substring(start,this.cursor);

            return new Token("TOKEN.NUMBER", value, loc);
        }

        if(!this.is_not_empty()) return false;

        throw Error(`Unexpected Token: ${JSON.stringify({x: first_char})} at ${loc.col}`);
    }

}