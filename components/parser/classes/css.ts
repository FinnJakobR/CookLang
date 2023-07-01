export default class CSS {
    text = "css";
    type = "css";
    props: CSS_PROP[];
    child: any;

    constructor(props: CSS_PROP[]){
        this.props = props;
    }

    addChild(child: any){
        this.child = child;
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