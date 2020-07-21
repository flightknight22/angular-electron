import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseComponent} from "../components/baseComponent";


@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent extends BaseComponent implements OnInit, OnDestroy {
  alert;
  src;
  textHeight;
  @ViewChild('myCanvas', {static: true}) canvasRef: ElementRef;
  constructor(private injector: Injector, element: ElementRef) {
    super(injector, element);
    this._styleBackground = 'red';

    this.alert = this.getOption('alert-details', null);
    try {
      this.alert = JSON.parse(this.alert);
    } catch (e) {
      window['Controller'].reload();
    }
    if(!this.alert) {
     window['Controller'].reload();
    }

    this.textHeight = this.height - 200 - (.25 * this.height);
    setInterval(()=> {this.toggleBackground();}, 1000);
  }

  toggleBackground() {
    this._styleBackground = this._styleBackground === 'red' ? 'black' : 'red';
  }



  // {\"Message\":\"title\",\"Detail\":\"message\",\"IsAudible\":true}

  ngOnInit() {
  }

  ngOnDestroy() {

  }
}
