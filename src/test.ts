import { TSDDocument } from "./TSDDocument.js";
import { TSDElement, TSDType } from "./TSDElement.js";
import { TSDParser } from "./TSDParser.js";

fetch("../Template.txt").then(v => v.text()).then(v => {

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

   document.body.innerHTML = "<pre>"+a.toString(false)+"</pre><br><pre>"+JSON.stringify(a.root?.getTypeTree())+"</pre>";
   console.log(a);
   console.log(a.root?.getTypeTree());
   
   window["a"] = a;
   
   
    
})

