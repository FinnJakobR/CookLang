import { PathOrFileDescriptor, chownSync, copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import { Lexer } from "./components/tokenizer/lexer";
import { Token, tokeType } from "./components/tokenizer/token";
import Location from "./components/location";
import Parser from "./components/parser/parser";
import Evaluation from "./components/evaluation/evaluation";


var OPTIONS: tokeType = {
  "help": "HELP",
  "compile": "COMPILE",
  "shopping": "SHOPPING_LIST"
}

function main(path: PathOrFileDescriptor): void {
    const source: string = readFileSync(path, {encoding: "utf-8"});
    const tokenizer: Lexer = new Lexer(source, path as string);
    var currentToken = tokenizer.nextToken();
    var tokens: Token[] = [];

    while(currentToken){
        tokens.push(currentToken);
        currentToken = tokenizer.nextToken();
    }

    tokens.push(new Token("TOKEN.END", "undefined", new Location(path as string,tokenizer.row, tokenizer.cursor - tokenizer.currentLineIndex)))

    var output = "[\n" +
  tokens.map(entry => JSON.stringify(entry)).join(",\n") +
  "\n]";

    writeFileSync("./tokens.txt", output);

    console.log("tokens sucessfull created");

    var parser = new Parser();

    const tree = parser.parse(tokens);

    const eva = new Evaluation();

    var html = "";

    for(var step of tree.steps){
      html+= eva.generateHTML(step);
    }

    console.log(html);

    writeFileSync("./output.html", html, {encoding: "utf-8"});

    writeFileSync("./tree.json", JSON.stringify(tree, null, "\t"));

}

function start():void {
  var args = process.argv;
  var path = args[2];

  if(!existsSync(path)) return error();

  main(path);

}


function error(){
  console.log("UNKNOWN COMMAND ... type h `help` for help!");
}

start();
