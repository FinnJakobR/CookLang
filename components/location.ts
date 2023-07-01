export default class Location {
    file_path: string;
    row: number;
    col: number;
    constructor(file_path:string, row:number, col: number){
        this.file_path = file_path;
        this.row = row;
        this.col = col;
    }
}