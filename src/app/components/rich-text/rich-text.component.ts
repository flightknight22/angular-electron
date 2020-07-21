import {Component, ElementRef, Injector} from '@angular/core';
import {BaseComponent} from "../baseComponent";
import {escape} from "querystring";

@Component({
  selector: 'app-rich-text',
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.css']
})
export class RichTextComponent extends BaseComponent {
  /** @hidden*/
  url;
  /** @hidden*/
  html: string;
  /** @hidden*/
  foreColor: string;
  native = false;

  constructor(private injector: Injector, element: ElementRef) {
    super(injector, element);

    this.foreColor = this.getOption('ForeColor', '');
    this.html = this.getOption('Html', '');
    this.url = `https://svc1.reveldigital.com/Render/Html?html=${encodeURIComponent(this.html)}&h=${this.height}&w=${this.width}`;
  }

  setNativeRender(val){
    this.native = val;
  }

  setHTML(html){
    this.html = html;
  }

  setText(newText){
    var domparser = new DOMParser();​​​​​​
    var doc = domparser.parseFromString(this.html, 'text/html');
    let t = this.html;
    this.html = this.html.replace(this.encodeHTML(doc.body.textContent), newText);
  }

  encodeHTML(mystring){
    return mystring.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  /** @hidden*/
  timeout() {
    const tempSrc = this.url;
    this.url = this.transparentSrc;
    setTimeout(()=> {
      this.url = tempSrc;
    }, 30*1000);
  }

}
