import {Component, ElementRef, Injector, OnInit} from '@angular/core';
import {BaseComponent} from "../baseComponent";

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.css']
})
export class QrCodeComponent extends BaseComponent implements OnInit {
  /** @hidden*/
  url = '';
  /** @hidden*/
  text: string;
  /** @hidden*/
  foreColor: string;
  /** @hidden*/
  backColor: string;

  constructor(private injector: Injector, element: ElementRef) {
    super(injector, element);
    this.foreColor = this.getOption('ForeColor', '');
    this.backColor = this.getOption('BackColor', '');
    this.text = encodeURIComponent(this.getOption('Text', ''));
    this.url = `https://svc1.reveldigital.com/Render/QRCode?text=${this.text}`+
      `&w=${this.width}&h=${this.height}&fg=${this.foreColor}&bg=${this.backColor}`;

  }
  /** @hidden*/
  ngOnInit() {
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
