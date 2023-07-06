import Location from "../location";

export interface tokeType {
    [char: string]: string;
}


export const literal_tokens: tokeType = {
    "(": "TOKEN.OPAREN",
    ")": "TOKEN.CPAREN",
    ",": "TOKEN.COMMA",
    ";": "TOKEN.POINT",
    "+": "TOKEN.ADD",
    "-": "TOKEN.SUBTRACT",
    "/": "TOKEN.DIVISION",
    "*": "TOKEN.MULTI",
    "=": "TOKEN.EQUAL",
    "|": "TOKEN.OR",
    "%": "TOKEN.PROCENT",
    "^": "TOKEN.EXPONENT",
    "#": "TOKEN.HASH",
    "@": "TOKEN.AT",
    "{": "TOKEN.CURLYOPAREN",
    "}": "TOKEN.CURLYCPAREN",
    ":": "TOKEN.DOUBLEPOINT",
    "\n": "TOKEN.NEWLINE",
    "~": "TOKEN.TILE",
    "_": "TOKEN.UNDERLINE",
    "`": "TOKEN.CODE",
    "[": "TOKEN.OBRACKET",
    "]": "TOKEN.CBRACKET",

}

export type NodeType = (keyof typeof literal_tokens) | (keyof typeof keywords);

export const keywords: tokeType = {
    "mg": "TOKEN.KEYWORD.MILIGRAM",
    "g": "TOKEN.KEYWORD.GRAM",
    "kg": "TOKEN.KEYWORD.KILOGRAM",
    "ml": "TOKEN.KEYWORD.MILITER",
    "l": "TOKEN.KEYOWoRD.LITER",
    "tsp": "TOKEN.KEYWORD.TEASPOON",
    "tbsp": "TOKEN.KEYWORD.TABLESPOON",
    "minutes": "TOKEN.KEYWORD.MINUTES",
    "hours": "TOKEN.KEYWORD.HOURS",
    "days": "TOKEN.KEYWORD.DAYS",
    "seconds": "TOKEN.KEYWORD.SECONDS",
    "procent": "TOKEN.KEYWORD.PROCENT",
    ">>": "TOKEN.META",
    "url": "TOKEN.URL"
};






export class Token {
    type: string;
    text: string;
    location: Location;

    constructor(type: string, text: string, location: Location){
        this.type = type;
        this.text = text;
        this.location = location;
    };
}