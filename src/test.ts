import { TSDDocument } from "./TSDDocument.js";
import { TSDElement, TSDType } from "./TSDElement.js";
import { TSDParser } from "./TSDParser.js";

fetch("../Template.txt").then(v => v.text()).then(v => {

/*     //ParserHelper.findClosingBracket(v, v.indexOf("{"))
    window["a"] = new TSDDocument(v);
    console.time()
    let a = (window["a"]).toString();
    console.timeEnd()
    console.log(a);
    console.time("parse")
    let b = new TSDDocument(a);
    console.timeEnd("parse");
    //console.log((new TSDDocument(a)).toString(true));
    console.log(JSON.stringify(b.root?.getTypeTree()));
    
    if (b.root) {
        b.root.value = [new TSDElement("b", 12)];
    }
    console.log(b);
 */    

    console.log(TSDParser.parse(v));
    
})