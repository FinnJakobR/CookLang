import { PathOrFileDescriptor, chownSync, readFileSync, writeFileSync } from "fs";
import { Lexer } from "./components/tokenizer/lexer";
import { Token } from "./components/tokenizer/token";
import Location from "./components/location";
import Parser from "./components/parser/parser";

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

    writeFileSync("./tree.json", JSON.stringify(tree, null, "\t"));

}

main("./example.recipe");
