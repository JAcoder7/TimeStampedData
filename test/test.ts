import { TSDDocument } from "../src/TSDDocument.js";
import { TSDElement, TSDType } from "../src/TSDElement.js";
import { TSDParser } from "../src/TSDParser.js";

fetch("../Template.tsd").then(v => v.text()).then(v => {

    /*     //ParserHelper.findClosingBracket(v, v.indexOf("{"))
        window["a"] = new TSDDocument(v);
        let a = (window["a"]).toString();
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

    console.time()
    let a = new TSDDocument(v);
    console.timeEnd()

    document.body.innerHTML = "<pre>" + a.toString(false) + "</pre><br><pre>" + JSON.stringify(a.root?.getTypeTree()) + "</pre>";
    if (a.root) a.root.onChange = v =>     document.body.innerHTML = "<pre>" + a.toString(false) + "</pre><br><pre>" + JSON.stringify(a.root?.getTypeTree()) + "</pre>";
    console.log(a);
    console.assert(TSDParser.parse(a.toString() as string).toString() == a.toString(), "AAAAAAAAAAAA");
    console.log(a.root?.getTypeTree());

    window["a"] = a;



})

