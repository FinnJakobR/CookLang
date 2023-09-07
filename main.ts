import { PathLike, PathOrFileDescriptor, chownSync, copyFileSync, existsSync, fstatSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
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

function main(path: PathOrFileDescriptor, output_path: PathOrFileDescriptor): void {


  if(lstatSync(path as PathLike).isDirectory()){

    var files = readdirSync(path as PathLike);

    for(var file of files){
     const source = readFileSync(`${path}/`+ file, {encoding: "utf-8"});
     const tokenizer = new Lexer(source, `${path}/`+ file);
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

    writeFileSync(`${output_path}/${file.split(".")[0]}_tokens.txt`, output);

    console.log("tokens for " + file + " sucessfull created");

    var parser = new Parser();

    var tree = parser.parse(tokens);

    console.log("ParseTree for " + file + " sucessfull created");

    writeFileSync(`${output_path}/${file.split(".")[0]}_tree.json`,JSON.stringify(tree, null, "\t"));

    const evaluation = new Evaluation();

    var html = "";

    for(var step of tree.steps){
      html+= evaluation.generateHTML(step);
    }

    writeFileSync(`${output_path}/${file.split(".")[0]}.html`, html, {encoding: "utf-8"});

    console.log("HTLML for " + file + " sucessfull generated");

    }


    return
 

  }else{
      const source = readFileSync(`${path}`, {encoding: "utf-8"});
      var filename = String(path).replace(/^.*[\\\/]/, '')
     const tokenizer = new Lexer(source, path as string);
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

    writeFileSync(`${output_path}/${filename.split(".")[0]}_tokens.txt`, output);

    console.log("tokens for " + filename + " sucessfull created");

    var parser = new Parser();

    var tree = parser.parse(tokens);

    console.log("ParseTree for " + filename + " sucessfull created");

    writeFileSync(`${output_path}/${filename.split(".")[0]}_tree.json`,JSON.stringify(tree, null, "\t"));

    const evaluation = new Evaluation();

    var html = "";

    for(var step of tree.steps){
      html+= evaluation.generateHTML(step);
    }

    writeFileSync(`${output_path}/${filename.split(".")[0]}.html`, html, {encoding: "utf-8"});

    console.log("HTLML for " + filename + " sucessfull generated");
  }

}

function start():void {
  var args = process.argv;
  var path = args[2];
  var output_path = args[3];

  if(!lstatSync(output_path).isDirectory()) output_path = path;

  if(!lstatSync(path).isDirectory()) {
    mkdirSync("outputs");
    output_path = "./outputs"; 
  }

  if(!existsSync(path)) return error();

  main(path, output_path);

}


function error(){
  console.log("UNKNOWN COMMAND ... type h `help` for help!");
}

start();
