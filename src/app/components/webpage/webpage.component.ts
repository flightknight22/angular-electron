import {Component, ElementRef, Injector, OnInit, ViewChild} from '@angular/core';
import {BaseComponent} from "../baseComponent";
import * as uuid from 'uuid';


@Component({
  selector: 'app-webpage',
  templateUrl: './webpage.component.html',
  styleUrls: ['./webpage.component.css']
})
export class WebpageComponent extends BaseComponent implements OnInit {
  /** @hidden*/
  html ='';
  /** @hidden*/
  uri: string;
  /** @hidden*/
  style: string;
  /** @hidden*/
  divStyle: string;
  /** @hidden*/
  frameId: string;
  /** @hidden*/
  lastTimestamp = '';
  /** @hidden*/
  pltName;
  /** @hidden*/
  @ViewChild('iframe',{static: true}) iframe: ElementRef;
  id = '';

  constructor(private injector: Injector, element: ElementRef) {
    super(injector, element);

    // console.log(this.frameId);
    this.html = this.getOption('Html', null);
    this.uri = this.getOption('Uri', null);
    this.id = uuid.v4();


    const engines = [
      '', '-webkit-', '-ms-', '-moz-'
    ];
    const transform = engines.map(o => `${o}transform:scale(1,1);${o}transform-origin: 0 0`).join(';');

    this.style = `${transform};-ms-zoom:1;width:` + this.width + `px;height:` + this.height + `px;`;
    this.divStyle = `width:` + this.width + `px;height:` + this.height + `px;`;

    // window.addEventListener('message', (message)=> {
    //     try{
    //
    //     }catch (e) {
    //
    //     }
    //     // if(typeof message.data === 'string' && message.data.indexOf('</timestamp>')>-1) {
    //     //   const timestamp =  message.data.substr(11,message.data.indexOf('</timestamp>')-11);
    //     //   if(timestamp !== this.lastTimestamp) {
    //     //     this.lastTimestamp = timestamp;
    //     //     console.log('message through',message);
    //     //   } else {
    //     //     console.log('filtered', timestamp);
    //     //   }
    //     //
    //
    //     //}
    //   //console.log(message)
    //
    //
    // });

  }




  /** @hidden*/
  ngOnInit() {
    this.pltName = this.templateService.platfrom.getPlatformInfo().name;
    //
    // console.log('iframe',this.iframe);
    // const s = this.iframe.nativeElement.document.createElement('script');
    // s.type = 'text/javascript';
    //
    // const code = `
    // <script>
    //     var id = '${this.id}-web';
    //     console.log('inside iframe', id);
    //     var testing = (strCode)=>{
    //       console.log(strCode, 'it was success');
    //     }
    //     var Client = {
    //       callback:testing
    //     }
    //
    // `;
    //
    //
    // console.log('iframe',this.iframe);
    // const s = this.iframe.nativeElement.document.createElement('script');
    // s.type = 'text/javascript';
    //
    //
    // try {
    // s.appendChild(document.createTextNode(code));
    // this.iframe.nativeElement.body.appendChild(s);
    // } catch (e) {
    // s.text = code;
    // document.body.appendChild(s);
    // }


  }

  /** @hidden*/
  executeJavascript(value:string) {
      console.log(value);
  }

  setHtml(html) {
    this.html = html;
  }

  setUri(uri) {
    this.uri = uri;
  }

  /** @hidden*/
  reload() {

  }
  /** @hidden*/
  injectClient() {
    const iFrameHead = window.frames;// .document.getElementsByTagName("head")[0]
    // console.log('test', iFrameHead);
    const script = document.createElement('script');
    script.type = 'text/javascript';
    // iFrameHead.appendChild(script);
  }
  /** @hidden*/
  guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
  /** @hidden*/
  timeout() {
    const tempSrc = this.uri;
    this.uri = this.transparentSrc;
    setTimeout(()=> {
      this.uri = tempSrc;
    }, 30*1000);
  }

}
