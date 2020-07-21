import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';


@Component({
  selector: 'app-webview',
  templateUrl: './webview.component.html',
  styleUrls: ['./webview.component.css']
})
export class WebviewComponent implements OnInit {

  @Input() uri: string;
  @Input() width: string;
  @Input() height: string;
  @Input() options: string;
  @Input() isGadget: boolean;
  @Input() isChrome: boolean;
  @Output() error = new EventEmitter<boolean>();
  @Output() load = new EventEmitter<boolean>();
  style: string;
  divStyle: string;
  html: string;




  constructor() {


  }

  onLoad() {
    this.load.emit(true);
  }

  onError() {
    this.error.emit(true);
  }

  ngOnInit() {

    if(this.isGadget){

      console.log(this.options);
      this.uri += "&up_rdW=" + this.width + "&up_rdH="
      + this.height + "&up_rdKey=" + window['Controller'].getDeviceKey();
      for(const option of this.options){
        this.uri += '&up_'+encodeURIComponent(option["name"])+'='+encodeURIComponent(option["value"])
      }
      this.uri = encodeURI('https://shindig.reveldigital.com/gadgets/ifr?url='+this.uri);
      console.log(this.uri);
      // for (com.reveldigital.player.api.Option option : source.file.gadget.options) {
      //   args.add("up_" + Uri.encode(option.getName()) + "="
      //     + Uri.encode(option.getValue()));
      //
      //   if ("BackColor".equals(option.getName())) {
      //     backColor = option.getValue();
      //   }
      // }
      //
      // String src = "https://shindig.reveldigital.com/gadgets/ifr?url="
      //   + Uri.encode(source.file.gadget.url) + "&up_rdW=" + module.width + "&up_rdH="
      //   + module.height + "&up_rdKey=" + MainActivity.RegistrationKey
      //   + "&lang=" + Locale.getDefault().getLanguage()
      //   + "&" + TextUtils.join("&", args);

      const engines = [
        '', '-webkit-', '-ms-', '-moz-'
      ];
    } else {
      const engines = [
        '', '-webkit-', '-ms-', '-moz-'
      ];
      const transform = engines.map(o => `${o}transform:scale(1,1);${o}transform-origin: 0 0`).join(';');

      this.style = `${transform};-ms-zoom:1;width:` + this.width + `px;height:` + this.height + `px;`;
      this.divStyle = `width:` + this.width + `px;height:` + this.height + `px;`;
    }
  }

}
