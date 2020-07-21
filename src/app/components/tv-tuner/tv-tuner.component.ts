import {Component, ElementRef, Injector, OnInit} from '@angular/core';
import {BaseComponent} from "../baseComponent";

@Component({
  selector: 'app-tv-tuner',
  templateUrl: './tv-tuner.component.html',
  styleUrls: ['./tv-tuner.component.css']
})
export class TvTunerComponent extends BaseComponent implements OnInit {
  /** @hidden*/
  url:string;
  /** @hidden*/
  tyType:string;
  /** @hidden*/
  channel:number;
  /** @hidden*/
  tvFormat:string;
  /** @hidden*/
  volume:number;
  /** @hidden*/
  isStream = true;

  constructor(private injector: Injector, element: ElementRef) {
    super(injector, element);
    this.tyType = this.getOption('TVType',null);
    this.channel = this.getOption('Channel',null);
    this.tvFormat = this.getOption('TVFormat',null);
    this.volume = this.getOption('Volume',null);
    this.url = this.getOption('Url',null);
    if(this.tyType.toLowerCase() === 'hdmi') {
      this.isStream = false;
    }
  }

  makeInt(str):number{
    return parseInt(str,10);
  }
  /** @hidden*/
  ngOnInit() {
  }

  //todo pause/play

}
