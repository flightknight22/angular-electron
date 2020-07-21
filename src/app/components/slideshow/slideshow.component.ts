import {
  ApplicationRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {BaseComponent} from "../baseComponent";
import {SmartScheduleService} from "../../../providers/smart-schedule-service";
import {Subscription} from "rxjs/Subscription";
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import {AffidavitService} from "../../../providers/affidavits-service";
import {Md5} from "ts-md5";
import { TweenMax, Sine} from 'gsap'



@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.component.html',
  styleUrls: ['./slideshow.component.css']
})
export class SlideshowComponent extends BaseComponent implements OnInit, OnDestroy {
  /** @hidden*/
  @ViewChild('imgOne', {static: true}) imgOne: ElementRef;
  /** @hidden*/
  @ViewChild('imgTwo', {static: true}) imgTwo: ElementRef;
  /** @hidden*/
  firstUrl = this.transparentSrc;
  /** @hidden*/
  secondUrl = this.transparentSrc;
  /** @hidden*/
  playlist: Array<any>;
  /** @hidden*/
  playlistCopy: Array<any>;
  /** @hidden*/
  topImgVisible = false;
  /** @hidden*/
  currentIndx = 0;
  /** @hidden*/
  timer;
  /** @hidden*/
  errorStop = false;
  /** @hidden*/
  abortedSources = 0;
  /** @hidden*/
  smartTimer: Observable<any>;
  /** @hidden*/
  sub: Subscription;
  /** @hidden*/
  transitionDuration = .9;
  currentRestCalls = 0;
  /** @hidden*/
  currentLoadedRss = [];
  /** @hidden*/
  Feed = require('rss-to-json');
  /** @hidden*/
  pltName;
  /** @hidden*/
  rssTimer: Observable<any>;
  /** @hidden*/
  rssSub: Subscription;
  startTime: Date;
  currentAffSource;
  PlayedListener:EventEmitter<any> = new EventEmitter();
  /** @hidden*/
  private currentAnimation = null;
  private kenBurns = null;
  constructor(private injector: Injector, private smartService: SmartScheduleService,
              private affidavitService: AffidavitService, element: ElementRef, private app: ApplicationRef) {
    super(injector, element);
    this.playlist = this.model.playlist.source;
    this.playlistCopy = JSON.parse(JSON.stringify(this.model.playlist.source));
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }



  getSource() {
    return this.playlist[this.currentIndx];
  }


  next(success?, auto?) {

      if (success && success === 'error' || success === 'error1' || success === 'error2') {
        this.abortedSources++;
        if (this.abortedSources > this.playlist.length * 2) {
          this.errorStop = true;
          this.stop();
          setTimeout(() => {
            this.errorStop = false;
            this.start();
          }, 5 * 1000);
        }
      }
      if(!auto){
        this.postAffidavit(false);
      }
      if(this.errorStop && !this.isStarted) {
        console.log('next called but sources haven\'t been loaded (error stop)');
      } else {
        if (success === 'error1') {
          this.firstUrl = this.transparentSrc;
          this.postAffidavit(false);
        } else if (success === 'error2') {
          this.secondUrl = this.transparentSrc;
          this.postAffidavit(false);
        }
        this.postAffidavit();
        this.PlayedListener.emit({onSourceCompleted: this.playlist[this.currentIndx], onSourceStarted: null});
        if (this.imgOne && this.imgTwo) {
          this.currentIndx++;
          if (this.playlist.length > 0) {
            this.currentIndx = this.currentIndx % this.playlist.length;
          }
          if(this.playlist[this.currentIndx] && this.playlist[this.currentIndx].type === "Rss") {
            this.next('error', true);
          } else if (this.playlist[this.currentIndx] && this.playlist[this.currentIndx].type === "Command") {
            try {
              window["Controller"].sendCommand([JSON.parse(this.playlist[this.currentIndx].value)]);
            } catch (e) {
              console.log(e);
            }
            this.next('error', true);
          } else {
            this.transition('next');
          }
        }
      }

  }


  previous(success?) {
    if (success && success === 'error1' || success === 'error2') {
      this.abortedSources++;
      if (this.abortedSources > this.playlist.length * 2) {
        this.errorStop = true;
        this.stop();
        setTimeout(() => {
          this.errorStop = false;
          this.start();
        }, 5 * 1000);
      }
    }
    this.PlayedListener.emit({onSourceCompleted:this.playlist[this.currentIndx],onSourceStarted:null});
    if(this.imgOne && this.imgTwo) {
      if (this.currentIndx - 1 < 0) {
        this.currentIndx = this.playlist.length;
      }
      this.currentIndx--;
      if(this.playlist.length>0) {
        this.currentIndx = this.currentIndx % this.playlist.length;
      }
      if(this.playlist[this.currentIndx] && this.playlist[this.currentIndx].type === "Rss") {
        this.previous('error');
      } else if (this.playlist[this.currentIndx] && this.playlist[this.currentIndx].type === "Command") {
        try {
          window["Controller"].sendCommand([JSON.parse(this.playlist[this.currentIndx].value)]);
        } catch (e) {
          console.log(e);
        }
        this.previous('error');
      } else {
        this.transition('prev');
      }
    }
  }

  setAffidavit(src){
    if(src) {
      this.currentAffSource = JSON.parse(JSON.stringify(src));
      this.startTime = new Date();
    }
  }

  postAffidavit(fullPlayThrough = true){
    if(this.currentAffSource && this.currentAffSource.fileid){
      let dur = new Date().getTime()-this.startTime.getTime();
      if(fullPlayThrough || dur>this.currentAffSource*1000){
        this.currentAffSource.duration = this.currentAffSource.interval * 1000;
      } else {
        this.currentAffSource.duration = dur;
      }
      this.affidavitService.mediaPlayed(this.currentAffSource);
    }
    this.startTime = null;
    this.currentAffSource = null;
  }



  getTransitionDuration() {
    return this.transitionDuration;
  }

  // /** @hidden*/
  transition(where?) {
    //this.log('transistion', this.playlist.length, this.model.name, this.topImgVisible);

    this.PlayedListener.emit({onSourceCompleted:null,onSourceStarted:this.playlist[this.currentIndx]});
    this.setAffidavit(this.playlist[this.currentIndx]);
    if(this.timer) {
      clearTimeout(this.timer);
      this.cycle();
    }
    if(this.playlist.length>1) {
      if (this.topImgVisible) {
        if(this.playlist.length === 2 || this.secondUrl === this.createUrl(this.playlist[this.currentIndx])) {
          this.fadeInElm(1, this.firstUrl, this.playlist[this.currentIndx]);
        }

        this.secondUrl = this.createUrl(this.playlist[this.currentIndx]);
        this.topImgVisible = false;

      } else {
        if(this.playlist.length === 2) {
          this.fadeInElm(2, this.secondUrl, this.playlist[this.currentIndx]);
        }
        if(this.firstUrl === this.createUrl(this.playlist[this.currentIndx])){
          this.fadeInElm(2, this.secondUrl, this.playlist[this.currentIndx])
        } else {
          this.firstUrl = this.createUrl(this.playlist[this.currentIndx]);
        }
        this.topImgVisible = true;
      }
    } else {
      if(this.playlist.length === 0) {
        this.firstUrl = this.transparentSrc;
        this.secondUrl = this.transparentSrc;
      } else {
        this.fadeInElm(1, this.firstUrl, this.playlist[this.currentIndx]);
        this.firstUrl = this.createUrl(this.playlist[this.currentIndx]);
        this.topImgVisible = true;
      }
    }
  }




  setSource(indx:any, play) {
    let sourceFound = false;
    if((typeof indx)==='number') {
      if(indx>-1 && indx<this.playlist.length) {
        this.currentIndx = indx;
        sourceFound = true;
      } else {
        console.log(`cannot set source input was:${indx} length of current playlist is ${this.playlist.length}`);
      }
    } else {
      try {
        let obj = '';
        if((typeof indx)==='object') {
          obj = JSON.stringify(indx);
        } else {
          obj = indx;
        }
        for(let i = 0; i<this.playlist.length; i++) {
          if(JSON.stringify(this.playlist[i])===obj) {
            this.currentIndx = i;
            sourceFound = true;
            break;
          }
        }
        if(!sourceFound) {
          console.log(`cannot set source. Object was not found. length of current playlist is ${this.playlist.length}`);
        }
      } catch (e) {
        console.log('source not set',e);
      }
    }
    if(play && sourceFound) {
      this.transition();
    } else if(play===false) {
    }
  }


  startAt (ind) {
    this.setSource(ind,false);
  }

  /** @hidden*/
  createUrl(link) {
    if(link.type === "WebPage") {
      const size = `${this.width}x${this.height}`;
      const token = Md5.hashStr('SoDiEH3RAL'+link.value+size);
      return `https://linkpeek.com/api/v1?uri=${link.value}&apikey=d1dfnlwel&token=${token}&size=${size}`;
    }
    if(!link.rssID) {
      return this.templateService.platfrom.getPath() + encodeURIComponent(link.value);
    }
    if(this.templateService.platfrom.isSpaceSensitive()) {
      return this.removeStringSpaces(link.value);
    }
    return link.value;
  }

  /** @hidden*/
  ngOnInit() {
    this.pltName = this.templateService.platfrom.getPlatformInfo().name;
    this.rssTimer = Observable.interval(1800*1000); // 30 mins
    this.smartTimer = Observable.interval(10*1000);
    this.parseModel();

    this.rssSub = this.rssTimer.subscribe(
      () => {
        this.parseModel();
      }
    );
  }

  /** @hidden*/
  fadeInElm(num, src?, item?) {
    let img;
    if(src !== this.transparentSrc) {
      this.abortedSources = 0;
    }
    if(num === 1 ) {
      img = this.imgOne;
    } else if(num === 2) {
      img = this.imgTwo;
    } else {
      return;
    }

    this.currentAnimation =  TweenMax.to(img.nativeElement, this.transitionDuration, {alpha:1})
    if(this.getTransistionType() === 'Pan Zoom') {
      TweenMax.to(img.nativeElement, 120, {
        scale: 2.6
      });
    }

    if(num === 1 ) {
      img = this.imgTwo;
    } else if(num === 2) {
      img = this.imgOne;
    } else {
      return;
    }


    this.fadeOutElm(img);
  }

  /** @hidden*/
  private getTransistionType() {
    for(const val of this.model.option){
      if(val.name == 'TransitionType'){
        return val.value;
      }
    }
    return null;
  }

  /** @hidden*/
  private fadeOutElm(img) {
    this.currentAnimation = TweenMax.to(img.nativeElement, this.transitionDuration, {alpha:0}).eventCallback("onComplete", (pram)=> {
      if(this.getTransistionType() === 'Pan Zoom') {
        TweenMax.to(img.nativeElement, 0, {
          scale: 1,
          top: 0,
          left: 0
        })
      }
    });

  }

  /** @hidden*/
  cycle() {
    if(this.isStarted) {
      let interval = 5;
      if(this.playlist[this.currentIndx] && this.playlist[this.currentIndx].interval) {
        interval = this.playlist[this.currentIndx].interval;
      }
      this.timer = setTimeout(() => {
        this.next('', true);
        this.cycle();
      }, interval * 1000);
    }
  }


  stop() {
    this.postAffidavit(false)
    if(this.isStarted){
      //todo record affidaviant
    }
    this.isStarted =false;

    if(this.sub) {
      this.sub.unsubscribe();
    }
    if(this.timer) {
      clearTimeout(this.timer);
    }
  }


  start() {
    this.isStarted =true;
    if(this.isAutoStart() || this.isInitialized) {
      this.sub = this.smartTimer.subscribe(
        () => {
          this.check();
        }
      );
      this.cycle();
    }
    this.check();
    if(this.playlist.length>0 && this.firstUrl===this.transparentSrc) {
      this.firstUrl = this.createUrl(this.playlist[0]);
      this.setAffidavit(this.playlist[0]);
    }
    this.isInitialized = true;
  }

  /** @hidden*/
  check() {
    const tmpArray = [];
    for(const val of this.playlistCopy) {
      if(this.smartService.eval(val.conditions)) {
        tmpArray.push(val);
      }
    }
    this.playlist = tmpArray;
  }

  /** @hidden*/
  parseModel() {
    const tempArry = [];
    for(let i = 0; i<this.playlistCopy.length; i++) {
      if(this.playlistCopy[i].type === 'Rss') {
        tempArry.push(this.playlistCopy[i]);
      }
    }
    this.currentRestCalls = tempArry.length;
    for(const val of tempArry) {
      this.getRSS(val.value, val.id, val.interval, val.conditions);
    }
  }

  /** @hidden*/
  getRSS(url, id, interval, conditions) {

    const tmpArray=[];
    this.Feed.load(this.corsUrl + url, (err, rss) => {

      for(const val of rss.items) {
        if(val.enclosures && val.enclosures.length>0 && val.enclosures[0].hasOwnProperty('url')) {
          let type = 'Image';
          if (val.enclosures[0].type.indexOf('video')>-1) {
            type = 'Video';
          }
          if(type === 'Image') {
            const json = {
              value: val.enclosures[0].url, type: type,
              timestamp: Date.now(), rssID: id, id: id, interval: interval, conditions: conditions
            };
            tmpArray.push(json);
          }
        }
      }
      this.currentLoadedRss[id] = tmpArray;
      this.currentRestCalls--;
      if(this.currentRestCalls===0) {
        this.injectSources();
      }
    },(err)=> {
      console.log(err);
      this.currentRestCalls--;
      if(this.currentRestCalls===0) {
        this.injectSources();
      }
    });
  }
  /** @hidden*/
  injectSources() {

    const tmpArry = [];
    for(let i = 0; i<this.playlistCopy.length; i++) {
      if(this.playlistCopy[i].type === 'Rss') {
        tmpArry.push(this.playlistCopy[i]);
      }
    }
    for(const feedSrc of tmpArry) {

      if(this.currentLoadedRss.hasOwnProperty(feedSrc.id)) {
        this.removeIndexFromFeed(feedSrc.id);
      }
      let num = 0;
      for(const val of this.currentLoadedRss[feedSrc.id]) {
        const i = this.playlistCopy.indexOf(this.playlistCopy.filter(obj=>obj.type==='Rss' && obj.id===feedSrc.id)[0])+1;
        this.playlistCopy.splice(i + num, 0, val);
        num += 1;
      }
    }
    this.check();
  }
  /** @hidden*/
  removeIndexFromFeed(id) {
    const tempArry = this.playlist.filter(val=> val.type!=='Rss' && val.id === id);
    for(const val of tempArry) {
      if(this.playlist.indexOf(val)>-1) {
        this.playlist.splice(this.playlist.indexOf(val), 1);
      }
    }
  }
  /** @hidden*/
  resolveURI(item) {
    if(item.hasOwnProperty('rssID')) {
      return item.value;
    }
    return this.templateService.platfrom.getPath()+item.value;
  }

  /** @hidden*/
  ngOnDestroy() {
    if(this.rssSub) {
      this.rssSub.unsubscribe();
    }
    if(this.sub) {
      this.sub.unsubscribe();
    }
    this.stop();
  }


}
