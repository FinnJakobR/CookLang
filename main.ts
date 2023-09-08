import { PathLike, PathOrFileDescriptor, chownSync, copyFileSync, existsSync, fstatSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { Lexer } from "./components/tokenizer/lexer";
import { Token, tokeType } from "./components/tokenizer/token";
import Location from "./components/location";
import Parser from "./components/parser/parser";
import Evaluation from "./components/evaluation/evaluation";
import { CSS } from "./components/evaluation/css";

function main(path: PathOrFileDescriptor, output_path: PathOrFileDescriptor, isDebug: boolean, enableCourseDirGeneration: boolean): void {

  var f = output_path;

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

   if(isDebug) console.log("tokens for " + file + " sucessfull created");

    var parser = new Parser();

    var tree = parser.parse(tokens);
    
    tree.courses = parser.courses;
    tree.tags = parser.tags;


    if(enableCourseDirGeneration) output_path = generateCoursesPath(parser.courses, output_path as string);




    if(!existsSync(output_path as PathLike)) mkdirSync(output_path as PathLike, {recursive: true});

  
    writeFileSync(`${output_path}/${file.split(".")[0]}_tokens.txt`, output);

   if(isDebug) console.log("ParseTree for " + file + " sucessfull created");

    writeFileSync(`${output_path}/${file.split(".")[0]}_tree.json`,JSON.stringify(tree, null, "\t"));

    const evaluation = new Evaluation();

    var html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${file.split(".")[0]}</title>
    </head>
    <body> ${CSS} <div class="title">${file.split(".")[0]}</div>`;

    for(var step of tree.steps){
      html+= evaluation.generateHTML(step);
    }

    html+=`</body></html>`








    writeFileSync(`${output_path}/${file.split(".")[0]}.html`, html, {encoding: "utf-8"});

  if(isDebug) console.log("HTLML for " + file + " sucessfull generated");

  
  
  output_path = f;
    


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

    if(isDebug) console.log("ParseTree for " + filename + " sucessfull created");

    if(isDebug) console.log(parser.tags, parser.courses);

    writeFileSync(`${output_path}/${filename.split(".")[0]}_tree.json`,JSON.stringify(tree, null, "\t"));

    const evaluation = new Evaluation();

    var html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${filename}</title>
    </head>
    <body>`;

    for(var step of tree.steps){
      html+= evaluation.generateHTML(step);
    }

    writeFileSync(`${output_path}/${filename.split(".")[0]}.html`, html, {encoding: "utf-8"});

    if(isDebug)  console.log("HTLML for " + filename + " sucessfull generated");
  }

}

function start():void {
  var args = process.argv;
  var path = args[2];
  var output_path = args[3];
  var options:string[] = [];

  var currentArg = 4;

  while(args[currentArg]){
    options.push(args[currentArg].trim());
    currentArg++;
  }


  var isDebug = options.includes("debug");
  var enableCourseDirGeneration = options.includes("courses");




  if(!lstatSync(output_path).isDirectory()) output_path = path;

  
  if(!lstatSync(path).isDirectory()) {
    mkdirSync("outputs");
    output_path = "./outputs"; 
  
  }



  if(!existsSync(path)) return error();

  main(path, output_path, isDebug, enableCourseDirGeneration);

}


function error(){
  console.log("UNKNOWN COMMAND ... type h `help` for help!");
}


function generateCoursesPath(courses: string[], output_path: string): string{

  
  if(courses.length == 0) return output_path;

  output_path = `${output_path}/${courses[0]}`;

  courses.shift();

  return generateCoursesPath(courses, output_path);


}

start();
