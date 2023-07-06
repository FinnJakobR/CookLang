export default class CSS {
    text = "css";
    type = "css";
    props: CSS_PROP[];
    childs: any;

    constructor(props: CSS_PROP[], childs: any){
        this.props = props;
        this.childs = childs;
    }
}


export class CSS_PROP {
    text = "css_prop";
    type = "css_prop";
    value: string;
    property: string;

    constructor(value: string, property: string){
        this.value = value;
        this.property = property;
    }
}