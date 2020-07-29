import {
  ApplicationRef, Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import {BaseComponent} from "../baseComponent";
import {AffidavitService} from "../../../providers/affidavits-service";
import {Subscription} from "rxjs/Subscription";
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import {SmartScheduleService} from "../../../providers/smart-schedule-service";
import {SettingsService} from "../../../providers/settings-service";
import { TweenMax} from 'gsap'


@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})

export class GalleryComponent extends BaseComponent implements OnInit, OnDestroy {
  /** @hidden*/
  currentSource: any = {type:'no source set', conditions:{}};
  /** @hidden*/
  @ViewChild('gallery', {static: true}) gallery: ElementRef;
  @ViewChild('vid', {static: true}) vid: ElementRef;
  /** @hidden*/
  currentIndex = -1;
  /** @hidden*/
  playlist = [];
  /** @hidden*/
  currentRestCalls = 0;
  /** @hidden*/
  currentLoadedRss = [];

  /** @hidden*/
  timer: Observable<any>;
  /** @hidden*/
  sub: Subscription;
  /** @hidden*/
  playlistCopy = [];
  /** @hidden*/
  intervalTimer;
  /** @hidden*/
  lastSource;
  /** @hidden*/
  transitionDuration = .9;
  /** @hidden*/
  firstPlay = true;
  /** @hidden*/
  abortedSources = 0;
  /** @hidden*/
  errorNext = 0;
  /** @hidden*/
  audioVolume = 1;
  /** @hidden*/
  loop = false;
  /** @hidden*/
  loopSrc;
  /** @hidden*/
  hardwareAccel = 'off';
  videoTimeout;
  currentAffSource;
  startTime:Date;
  PlayedListener:EventEmitter<any> = new EventEmitter();

  /** @hidden*/
  private currentAnimation = null;

  constructor(private injector: Injector, private affidavitService: AffidavitService, private smartService: SmartScheduleService,
              element: ElementRef, private app: ApplicationRef, settingService:SettingsService) {
    super(injector, element);

    settingService.readSettings().then((settings:any)=> {
      this.changeHardwareAccel(settings.general["hardwareAcceleration"]);
    });
    settingService.onSettingsChanged.subscribe((settings:any)=> {
      this.changeHardwareAccel(settings.general["hardwareAcceleration"]);
    });
    this.audioVolume = this.getOption('Volume', 1);
  }

  changeHardwareAccel(bool) {
    if(bool) {
      this.hardwareAccel = 'on';
    } else {
      this.hardwareAccel = 'off';
    }
  }

  /** @hidden*/
  videoPlay() {
    this.videoTimeout = setTimeout(()=> {this.next();}, 15 * 1000);
  }


  /** @hidden*/
  clearVideoTimeout() {
    if(this.videoTimeout) {
      clearTimeout(this.videoTimeout);
    }
  }


  /** @hidden*/
  setVideoTimeout() {
    this.videoTimeout = setTimeout(()=> {this.next();}, 15 * 1000);
  }

  getSource() {
    return this.currentSource;
  }

  vidTest(el){
    try {
      // el.muted = false;
      // el.volume = this.audioVolume;
    } catch (e) {
      console.log(e);
    }
    this.fadeInElm();
  }

  /** @hidden*/
  setVolumeEl(el) {
    el.volume = this.audioVolume;
    console.log(el);

  }

  setAffidavit(){
    if(this.playlist[this.currentIndex]) {
      this.currentAffSource = JSON.parse(JSON.stringify(this.playlist[this.currentIndex]));
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

  next(success?, debug?, auto?) {
    if(success && success === 'error') {
      this.abortedSources++;
      if(this.abortedSources>this.playlistCopy.length*2) {
        if(this.intervalTimer) {
          clearTimeout(this.intervalTimer);
        }

        this.stop();
        setTimeout(()=> {
          this.start();
        }, 5*1000);
      }
    } else {
      this.abortedSources = 0;
    }
    if(!auto){
      this.postAffidavit(false);
    }
    this.clearVideoTimeout();

    if(this.gallery && this.playlist.length>0) {
      if(!this.loop) {
        this.currentIndex++;
        this.currentIndex = this.currentIndex % this.playlist.length;

        if (this.playlist[this.currentIndex].type === 'Rss' || this.playlist[this.currentIndex].type === 'Command'
          || !this.smartService.eval(this.playlist[this.currentIndex].conditions)) {
          if (this.playlist[this.currentIndex].type === 'Command') {
            const json = JSON.parse(this.playlist[this.currentIndex].value);
            const tempJson = {name: "", arg: ""};
            if (json.hasOwnProperty('Name')) {
              tempJson['name'] = json.Name;
            }
            if (json.hasOwnProperty('Arg')) {
              tempJson['arg'] = json.Arg;
            }
            window["Controller"].sendCommand([tempJson]);
          }
          if (this.isStarted) {
            this.next('error', 'called from next itself', true);
          }
          return;
        }
      }
      this.transition();
    }
  }

  previous() {
    if(this.gallery && this.playlist.length>1) {
      if(!this.loop) {
        this.currentIndex--;
        if (this.currentIndex < 0) {
          this.currentIndex = this.playlist.length;
        }
        this.currentIndex = this.currentIndex % this.playlist.length;

        if (this.playlist[this.currentIndex].type === 'Rss' || !this.smartService.eval(this.currentSource.conditions)) {
          this.previous();
          return;
        }
      }
      this.transition();
    }
  }

  /** @hidden*/
  transition() {
    this.PlayedListener.emit({onSourceCompleted:this.playlist[this.currentIndex],onSourceStarted:null});
    if(this.currentAnimation) {
      this.currentAnimation.kill();
    }
    if(this.intervalTimer) {
      clearTimeout(this.intervalTimer);
    }
    if(!this.firstPlay) {
      if(!this.isDuplicateSource(this.playlist[this.currentIndex]) || this.playlist[this.currentIndex].type!=='WebPage'
        && this.playlist[this.currentIndex].type!=='Image' && this.playlist[this.currentIndex].type!=='Svg' && this.playlist[this.currentIndex].type!=='Template') {
        this.fadeOutElm(() => {
          this.postAffidavit();
          this.PlayedListener.emit({onSourceCompleted: null, onSourceStarted: this.playlist[this.currentIndex]});
          if (this.isStarted) {
            if (this.isDuplicateSource(this.playlist[this.currentIndex]) || this.loop) {
                this.resetSrc();
            }
            if(this.playlist[this.currentIndex].type==='Template' || this.playlist[this.currentIndex].type==='YouTube' || this.playlist[this.currentIndex].type==='Gadget') {
              this.injectNoneSrc();
            }
            this.currentSource = this.playlist[this.currentIndex];

            this.lastSource = this.currentSource;

            // console.log(this.getName(), 'set source', this.currentSource, 1, this.currentIndex);
            this.cycle();
          }
        });
      } else {

        this.cycle();
      }
    } else {
      this.currentSource = this.playlist[this.currentIndex];
      this.lastSource = this.currentSource;
      this.firstPlay = false;
      this.cycle();
      // console.log(this.getName(),'set source', this.currentSource, 2);
    }

  }

  /** @hidden*/
  isDuplicateSource(src) {
    return this.lastSource === src;
  }

  isDuplicateType(src) {
    return this.lastSource.type === src.type;
  }

  injectNoneSrc() {
    this.currentSource = {
      type: 'None', conditions: [
        {
          "type": "Always",
          "sequence": 0,
          "value1": "",
          "value2": "",
          "value3": "",
          "value4": "",
          "complement": false,
          "operator": 0
        }
      ],
    };
    this.app.tick();
  }

  /** @hidden*/
  resetSrc() {
    // console.log('reset');
    const tmpSrc = this.currentSource;
    if(this.currentSource.type!=='WebPage' && this.currentSource.type!=='Image' && this.currentSource.type!=='Template') {
      this.injectNoneSrc();
      setTimeout(()=> {
        this.currentSource = tmpSrc;
      },100);
    }
  }

  /** @hidden*/
  cycle() {
    if(this.intervalTimer) {
      clearTimeout(this.intervalTimer);
    }
    if(this.isAutoSource(this.currentSource)) {
      this.intervalTimer = setTimeout(() => this.next('timer', '', true), this.currentSource.interval * 1000);
    }
    if(this.currentSource.type === 'Video') {
      this.setVideoTimeout();
    }
  }

  /** @hidden*/
  public fadeInElm() {
    this.setAffidavit();
    TweenMax.set(this.gallery.nativeElement, {z:0.1});
    this.currentAnimation = TweenMax.to(this.gallery.nativeElement, this.transitionDuration, {alpha:1});
  }

  /** @hidden*/
  public fadeOutElm(cb) {
    TweenMax.set(this.gallery.nativeElement, {z:0.1});
    this.currentAnimation =  TweenMax.to(this.gallery.nativeElement, this.transitionDuration, {alpha:0});
    this.currentAnimation.eventCallback("onComplete", cb);
    this.resetTimer();
  }


  setLooping(flag:boolean) {
    this.loop = flag;
  }

  setTransitionDuration(val:number) {
    this.transitionDuration = val;
  }

  setVolume(num:number) {
    this.audioVolume = num;
  }

  setSource(indx:any, play) {
    let sourceFound = false;
    if((typeof indx)==='number') {
      if(indx>-1 && indx<this.playlist.length) {
        this.currentIndex = indx;
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
            this.currentIndex = i;
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
  startLoadTimer() {
    /// this.loadTimer.
  }
  /** @hidden*/
  resetTimer() {
    // console.log('called reset');
  }
  /** @hidden*/
  resumeCycle(success?) {
    this.next(success, '', true);
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
  isAutoSource(source) {
    switch (source.type) {
      case 'Video':
          return false;
      case 'Audio':
        return false;
      case 'YouTube':
        return false;
      case 'Rss':
        return false;
      case 'None':
        return false;
      default:
        return true;
    }
  }


  start() {
    if(!this.isStarted) {
      if (this.playlist.length > 0 && this.currentIndex === -1) {
        this.currentSource = this.playlist[0];
        this.setAffidavit();
        this.lastSource = this.currentSource;
      }
      this.isStarted = true;
      if (this.autoStart || this.isInitialized) {
        this.next();
      }
      this.isInitialized = true;
    }
  }


  stop() {
    this.postAffidavit(false);
    // console.log(this.currentSource, this.currentIndex, this.playlist);
    this.sub.unsubscribe();
    this.currentSource = {type:'None', "conditions": [
        {
          "type": "Always",
          "sequence": 0,
          "value1": "",
          "value2": "",
          "value3": "",
          "value4": "",
          "complement": false,
          "operator": 0
        }
      ],
    };
    this.lastSource = this.currentSource;
    if(this.intervalTimer) {
      clearTimeout(this.intervalTimer);
    }
    this.isStarted = false;
  }
  /** @hidden*/
  ngOnInit() {
    this.timer = Observable.interval(1800*1000); // 30 mins
    if(this.model.playlist && this.model.playlist.hasOwnProperty('source')) {
      this.playlist = this.playlist.concat(this.model.playlist.source);
      this.playlistCopy = this.playlistCopy.concat(this.model.playlist.source);
    }
    this.parseModel();

    this.sub = this.timer.subscribe(
      () => {
        this.parseModel();
      }
    );

  }
  /** @hidden*/
  getRSS(url, id, interval, conditions) {
      const tmpArray=[];
      // Feed.load(this.corsUrl + url, (err, rss) => {
      //
      //  for(const val of rss.items) {
      //    if(val.enclosures && val.enclosures.length>0 && val.enclosures[0].hasOwnProperty('url')) {
      //        let type = 'Image';
      //        if (val.enclosures[0].type.indexOf('video')>-1) {
      //          type = 'Video';
      //        }
      //        const json = {value:val.enclosures[0].url, type:type,
      //          timestamp:Date.now(), rssID:id, id:id, interval:interval, conditions:conditions};
      //        tmpArray.push(json);
      //      }
      //    }
      //   this.currentLoadedRss[id] = tmpArray;
      //   this.currentRestCalls--;
      //   if(this.currentRestCalls===0) {
      //     this.injectSources();
      //   }
      // },(err)=> {
      //   console.log(err);
      //   this.currentRestCalls--;
      //   if(this.currentRestCalls===0) {
      //     this.injectSources();
      //   }
      // });
  }
  /** @hidden*/
  injectSources() {
    const tmpArry = [];
    for(let i = 0; i<this.playlist.length; i++) {
      if(this.playlist[i].type === 'Rss') {
        tmpArry.push(this.playlist[i]);
      }
    }
    for(const feedSrc of tmpArry) {

      if(this.currentLoadedRss.hasOwnProperty(feedSrc.id)) {
        this.removeIndexFromFeed(feedSrc.id);
      }
      let num = 0;
      for(const val of this.currentLoadedRss[feedSrc.id]) {
        const i = this.playlist.indexOf(this.playlist.filter(obj=>obj.type==='Rss' && obj.id===feedSrc.id)[0])+1;
        this.playlist.splice(i + num, 0, val);
        num += 1;
      }
    }
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
  resolveVideoURI(item) {

    if(item.hasOwnProperty('rssID')) {
      return item.value;
    }
    let extension = '.zc.mp4';
    if(this.templateService.platfrom.revelDeviceName()!=='Web' || this.templateService.platfrom.getPlatformInfo().name==='chrome') {
      extension = '';
    }
    return this.templateService.platfrom.getPath()+item.value+extension;

    // return `https://uploads.cdn.reveldigital.com/${item.value}.zc.m.mp4`;
  }
  /** @hidden*/
  resolveAudioURI(item) {
    return this.templateService.platfrom.getPath()+item.value;
  }
  /** @hidden*/
  ngOnDestroy() {
    this.sub.unsubscribe();
  }


}
