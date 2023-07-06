export default class LINK{
    type = "url";
    hyperText: any[];
    url: string;

    constructor(hyperText: any[], url: string){
        this.hyperText = hyperText;
        this.url = url;
    }
}