/*
recipe = { metadata | step }- ;

(* not sure how to show that, but two below should start from a new line *)
metadata = ">", ">", { text item - ":" }-, ":", { text item }-, new line character ;
step     = { text item | ingredient | cookware | timer }-, new line character ;

ingredient           = one word ingredient | multiword ingredient ;
one word ingredient  = "@", one word component ;
multiword ingredient = "@", multiword component ;

cookware             = one word cookware | multiword cookware ;
one word cookware    = "#", one word component ;
multiword cookware   = "#", multiword component ;

timer                = no name timer | one word timer | multiword timer ;
no name timer        = "~", no name component ;
one word timer       = "~", one word component ;
multiword timer      = "~", multiword component ;

no name component    =                             "{", [ amount ], "}" ;
one word component   = word,                     [ "{", [ amount ], "}" ] ;
multiword component  = word, { text item - "{" }-, "{", [ amount ], "}" ;

amount   = quantity | ( quantity, "%", units ) ;
quantity = { text item - "%" - "}" }- ;
units    = { text item - "}" }- ;

word      = { text item - white space - punctuation character }- ;
text item = ? any character except new line character ? ;

(* https://en.wikipedia.org/wiki/Template:General_Category_(Unicode) *)
new line character    = ? newline characters (U+000A ~ U+000D, U+0085, U+2028, and U+2029) ? ;
white space           = ? Unicode General Category Zs and CHARACTER TABULATION (U+0009) ? ;
punctuation character = ? Unicode General Category P* ? ;

comments       = "-", "-", text item, new line character ;
block comments = "[", "-", ? any character except "-" followed by "]" ?, "-", "]" ;
*/
import METADATA from "./metadata";
import STEP from "./step";

 

export default class ParsingTree {
    metadata: METADATA[];
    steps: STEP[];
    courses: null | string[];
    tags: null | string[];
    constructor(){
        this.courses = null;
        this.tags = null;
        this.metadata = [];
        this.steps = [];
    }

    addMetaData(data: METADATA): void{
        this.metadata.push(data);
        return 
    }

    addStep(step: STEP) : void{
        this.steps.push(step);
        return;
    }
}