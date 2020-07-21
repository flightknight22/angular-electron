import {Component, ElementRef, Injector, OnInit} from '@angular/core';
import {BaseComponent} from "../baseComponent";

@Component({
  selector: 'app-shape',
  templateUrl: './shape.component.html',
  styleUrls: ['./shape.component.css']
})
export class ShapeComponent extends BaseComponent implements OnInit {
  /** @hidden*/
  foreColor: string;
  /** @hidden*/
  backColor: string;
  /** @hidden*/
  shapeType: any;
  /** @hidden*/
  strokeColor: any;
  /** @hidden*/
  strokeWidth: any;
  /** @hidden*/
  radius: any;
  /** @hidden*/
  url;
  constructor(private injector: Injector, element: ElementRef) {
    super(injector, element);
    this.foreColor = this.getOption('ForeColor', '');
    this.backColor = this.getOption('BackColor', '');
    this.shapeType = this.getOption('ShapeType', 'Rectangle');
    this.strokeColor = this.getOption('StrokeColor', '');
    this.strokeWidth = this.getOption('StrokeWidth', '0');
    this.radius = this.getOption('Radius', '0');
    this.url = `https://svc1.reveldigital.com/Render/Shape?type=${this.shapeType}&h=${this.height}&w=
    ${this.width}&fg=${this.foreColor}&bg=${this.backColor}&sw=${this.strokeWidth}&sc=${this.strokeColor}&r=${this.radius}`;
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
