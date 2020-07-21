import {Component, ElementRef, Injector, OnInit, ViewChild} from '@angular/core';
import {BaseComponent} from "../baseComponent";

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css'],
})
export class TextComponent extends BaseComponent implements OnInit {

  /** @hidden*/
  @ViewChild('container', {static: true}) container: ElementRef;
  /** @hidden*/
  foreColor: string;
  /** @hidden*/
  fontFamily: string;
  /** @hidden*/
  text: string;
  /** @hidden*/
  src: string;
  /** @hidden*/
  position = 'absolute';
  /** @hidden*/
  left = '';
  /** @hidden*/
  right = '';
  /** @hidden*/
  margin = '';
  /** @hidden*/
  display = 'block';
  adjustedWidth = 0;
  native = false;
  fontSize = '20px';

  constructor(private injector: Injector, element: ElementRef) {
  super(injector, element);

    this.foreColor = this.getOption('ForeColor', '');
    this.fontFamily = this.getOption('FontFamily', 'Arial');
    this.text = encodeURIComponent(this.getOption('Text', ''));
  }


  setText(text) {
    this.text = text;
    this.src = 'https://svc1.reveldigital.com/Render/Text?text='+this.text+'&w='+this.adjustedWidth+'&h='+this.height+'&font'+
      '='+this.fontFamily+'&fg='+this.foreColor+'&bg=';
  }




  /** @hidden*/
  ngOnInit() {

    const alignment = this.getOption('Alignment', 'Fill');

    let w = this.width;

    switch (alignment) {
      case 'Fill':
        w = this.width;
        this.position = 'absolute';
        this.left = '0';
        this.right = '0';
        this.margin = '';
        this.display = 'block';
        break;
      case 'Center':
        w = 0;
        this.position = '';
        this.left = '0';
        this.right = '0';
        this.margin = '0 auto';
        this.display = 'table';
        break;
      case 'Left':
        w = 0;
        this.position = 'absolute';
        this.left = '0';
        this.right = '';
        this.margin = '';
        this.display = 'block';
        break;
      case 'Right':
        w = 0;
        this.position = 'absolute';
        this.left = '';
        this.right = '0';
        this.margin = '';
        this.display = 'block';
        break;
    }
    this.adjustedWidth = w;

    this.src = 'https://svc1.reveldigital.com/Render/Text?text='+this.text+'&w='+w+'&h='+this.height+'&font'+
    '='+this.fontFamily+'&fg='+this.foreColor+'&bg=';
  }
  /** @hidden*/
  timeout() {
    const tempSrc = this.src;
    this.src = this.transparentSrc;
    setTimeout(()=> {
      this.src = tempSrc;
    }, 30*1000);
  }


}
