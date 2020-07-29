import {AfterViewInit, Component, ElementRef, HostBinding, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseComponent} from "../baseComponent";
import {Subscription} from "rxjs/Subscription";
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import {SmartScheduleService} from "../../../providers/smart-schedule-service";




@Component({
  selector: 'app-marquee',
  templateUrl: './marquee.component.html',
  styleUrls: ['./marquee.component.css']
})
export class MarqueeComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  /** @hidden*/
  currentFeed = {};
  /** @hidden*/
  list;
  /** @hidden*/
  @ViewChild('myCanvas', {static: true}) canvasRef: ElementRef;
  /** @hidden*/
  fontFamily = "Arial";
  /** @hidden*/
  timer: Observable<any>;
  /** @hidden*/
  sub: Subscription;
  /** @hidden*/
  smartTimer: Observable<any>;
  /** @hidden*/
  smartSub: Subscription;
  /** @hidden*/
  scrollDirection = 'left';
  /** @hidden*/
  scrollSpeed = 0;
  /** @hidden*/
  @HostBinding('style.color')
  _styleColor = 'white';
  /** @hidden*/
  @HostBinding('style.font-family')
  _styleFontFamily = 'Arial';
  /** @hidden*/
  @HostBinding('style.font-size')
  _styleFontSize = '1vh';
  /** @hidden*/
  @HostBinding('style.line-height')
  _styleLineHeight = '1vh';

  constructor(private injector: Injector, private smartService: SmartScheduleService, element: ElementRef) {
    super(injector, element);
    this._styleColor = 'white';
    this._styleFontFamily = 'Arial';
    this._styleFontSize = this.height/this.templateHeight*100+'vh';
    this._styleLineHeight = this.height/this.templateHeight*100+'vh';
  }
  /** @hidden*/
  ngOnInit() {
    this.getRSS();
    this.timer = Observable.interval(1800*1000);
    this.smartTimer = Observable.interval(10*1000);
  }
  /** @hidden*/
  getRSS() {
    if (this.model.playlist && this.model.playlist.hasOwnProperty('source')) {
      for (let indx = 0; indx < this.model.playlist.source.length; indx++) {
        // Feed.load(this.corsUrl + this.model.playlist.source[indx].value, (err, rss) => {
        //   if(rss) {
        //     rss = rss.items.map(val => this.formatDescription(val.description, this.model.playlist.source[indx].conditions))
        //       .filter(val => val != null);
        //     if (this.model.playlist.source[indx].id && rss) {
        //       this.currentFeed[this.model.playlist.source[indx].id] = rss;
        //     }
        //   }
        //   // this.list=[{text:'test',isValid:true}];
        //   this.items();
        // });
      }
    }
  }
  /** @hidden*/
  items() {
    this.list = [];
    for (const key in this.currentFeed) {
      if (this.currentFeed.hasOwnProperty(key)) {
        this.list = this.list.concat(this.currentFeed[key]);
      }
    }
    // console.log(this.list);
  }

  /** @hidden*/
  formatDescription(text, conditions) {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = text;
    const description = tmp.textContent || tmp.innerText || "";
    if (description.replace(/ /g, '').length > 3) {
      return {text:description.trim()+'•  •', conditions:conditions, isValid:this.smartService.eval(conditions)};
    }
    return null;
  }
  /** @hidden*/
  ngAfterViewInit() {


  }

  /** @hidden*/
  ngOnDestroy() {
    this.sub.unsubscribe();
    this.smartSub.unsubscribe();
  }


  start() {
    this.isStarted = true;
    const direction = this.getOption('TickerType', 'left');
    if(direction!=='Scroll Left') {
      this.scrollDirection = 'right';
    }
    this.scrollSpeed = this.getOption('ScrollSpeed', 15)*.2;
    this.isInitialized = true;
    this.sub = this.timer.subscribe(
      () => {
        this.getRSS();
      }
    );
    this.smartSub = this.smartTimer.subscribe(
      () => {
        this.check();
      }
    );
  }

  stop() {
    this.sub.unsubscribe();
    this.smartSub.unsubscribe();
    this.isStarted = false;
    this.scrollSpeed = 0;
  }


  /** @hidden*/
  check() {
    if(this.list) {
      for (const val of this.list) {
        val.isValid = this.smartService.eval(val.conditions);
      }
    }
  }



  /** @hidden*/
  scrollLeft() {

  }

  /** @hidden*/
  scrollRight() {

  }
}
