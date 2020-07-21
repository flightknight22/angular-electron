import {ApplicationRef, Component, ElementRef, EventEmitter, Injector, OnInit, ViewChild} from '@angular/core';
import {BaseComponent} from "../baseComponent";
import * as uuid from 'uuid';


@Component({
  selector: 'app-gadget',
  templateUrl: './gadget.component.html',
  styleUrls: ['./gadget.component.css']
})
export class GadgetComponent extends BaseComponent implements OnInit {
  @ViewChild('gadget',{static: true}) iframe: ElementRef;
  /** @hidden*/
  uri: string;
  /** @hidden*/
  source: string;
  /** @hidden*/
  style: string;
  /** @hidden*/
  pltName;
  /** @hidden*/
  id;
  callback = new EventEmitter<any>();
  onLoad = new EventEmitter<any>();

constructor(private injector: Injector, element: ElementRef, private app: ApplicationRef) {
  super(injector, element);

}



executeJavascript(code){

  this.iframe.nativeElement.contentWindow.postMessage(`{"gadget-${this.id}":"${code}"}`, '*');
}

/** @hidden*/
  ngOnInit() {
  this.id = uuid.v4();
  let eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
  let eventer = window[eventMethod];
  let messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

// Listen to message from child window
  eventer(messageEvent,(e)=> {
    try{
      let messageCB = JSON.parse(e.data);
      if(messageCB.hasOwnProperty(this.id)){
        console.log('here');
        this.callback.emit(messageCB[this.id]);
      } else if(messageCB.hasOwnProperty(this.id+'-command')){
        window["Controller"].sendCommand([messageCB[this.id+'-command']]);
      }
    } catch (e) {}
  },false);

  this.pltName = this.templateService.platfrom.getPlatformInfo().name;
    this.source = this.getOption('Source');
    let opts = this.options.filter(o => ['rdW', 'rdH', 'rdKey', 'regkey', 'blurb'].indexOf(o.name) === -1).map(
      o => `up_${o.name}=${encodeURIComponent(o.value)}`).join('&');


    opts += '&synd=open';
    opts += `&up_rdW=${this.width}`;
    opts += `&up_rdH=${this.height}`;
    opts += `&up_rdwID=${this.id}`;
    opts += `&up_rdTimeZoneName=${window["Controller"].getTimeStats().tz}`;
    opts += `&up_rdTimeZoneID=${window["Controller"].getTimeStats().tzID}`;
    opts += `&up_rdTimeZoneOffset=${window["Controller"].getTimeStats().tzOffset}`;
    opts += `&up_rdKey=${window["Controller"].getDeviceKey()}`;

    if (this.source === '') {
      this.uri = '';
    } else {
      this.uri = `https://shindig.reveldigital.com/gadgets/ifr?url=${encodeURIComponent(this.source)}&${opts}`;
    }

    const engines = [
      '', '-webkit-', '-ms-', '-moz-'
    ];

  }

  loadedCB(){
    this.onLoad.emit(true);
  }

  /** @hidden*/
  timeout() {
    const tempSrc = this.uri;
    this.uri = null;
    setTimeout(()=> {
      this.uri = tempSrc;
    }, 30*1000);
  }
}
