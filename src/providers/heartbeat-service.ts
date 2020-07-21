import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import {Subscription} from "rxjs/Subscription";
import {ScheduleService} from "./schedule-service";
import * as html2canvas from "html2canvas";
import {SettingsService} from "./settings-service";
declare const takeScreenshot: any;
declare const createBase64Snap: any;
declare const getSystemStats: any;
declare const getDownloadStats: any;

export enum STATUS {
  ALIVE = 1,
  DOWNLOADING = 2,
  PLAYING = 4,
  MOTION = 8
}


@Injectable()

export class HeartbeatService implements OnDestroy {

  model = {
    CpuUsage:null,
    DiskUsage:null,
    MacAddress:null,
    IpAddress:null,
    MemoryUsage:null,
    PlayerVersion:null,
    OSVersion:null,
    bytesReceived:null,
    transferRate:null,
    lastLocation:null,
    Latitude:null,
    Longitude:null,
    Snap:null,
    CurrentSchedule: null,
    Uptime:null //milliseconds
  };
  currentStatus = [];
  timer: Observable<any>;
  sub: Subscription;
  isTakingScreenShot = false;
  device_info: any;
  sendSnap = false;
  timestamp:any = new Date().getTime();
  prevLoc;


  constructor(private settingService:SettingsService, private http: HttpClient,
              private scheduleService:ScheduleService) {
      settingService.readSettings().then((settings:any)=> {
        this.sendSnap = settings.general["include snapshot"];
      });
      settingService.onSettingsChanged.subscribe((settings:any)=> {
        this.sendSnap = settings.general["include snapshot"];
      });
      this.sendPing();
      this.timer = Observable.interval(  30 * 1000);

      this.sub = this.timer.subscribe(
        () => {
          this.model.Snap = null;
          if ((typeof takeScreenshot) === 'undefined') {
            if(this.sendSnap) {

              // @ts-ignore
              html2canvas(document.body, {
                async: true, logging: false, scale: .2,
                ignoreElements: (node) => {
                  return node.nodeName === 'IFRAME';
                }
              }).then(canvas => {
                this.model.Snap = canvas.toDataURL("image/png");
                this.model.Snap = this.model.Snap.slice('data:image/png;base64,'.length);
                this.sendPing();
              });
            } else {
              this.sendPing();
            }
          } else {
            if(!this.isTakingScreenShot && this.sendSnap) {
              this.isTakingScreenShot = true;
              takeScreenshot().then(() => {
                createBase64Snap().then((data) => {
                  this.isTakingScreenShot = false;
                  this.model.Snap = data;
                  this.sendPing();
                }).catch(() => {
                  this.sendPing();
                });
              })
                .catch(() => {
                  this.sendPing();
                  console.log('There was a error taking a screenshot');
                });
            } else {
              this.sendPing();
            }
          }
        },(err)=> {
          console.log(err);
        });

  }



  removeStatus(status) {
    this.currentStatus.splice(this.currentStatus.indexOf(status),1);
  }

  addStatus(status) {
    if(this.currentStatus.indexOf(status)===-1) {
      this.currentStatus.push(status);
    }
  }


  sendPing() {
    if(window['player']) {
      this.model.PlayerVersion = window['player'].version;
    }
    this.model.Uptime = new Date().getTime() - this.timestamp;
    if(window['Controller'] && window['Controller'].getTemplate() && window['Controller'].getTemplate().model && window['Controller'].getTemplate().model.name) {
      this.model.CurrentSchedule = window['Controller'].getTemplate().model.name;
    }
    this.model.OSVersion = navigator.userAgent;

    if((typeof getSystemStats) !== 'undefined') {
       getSystemStats().then((stats)=>{
        this.model.CpuUsage = stats.cpu;
        this.model.MacAddress = stats.mac;
        this.model.DiskUsage = stats.disk;
        this.model.MemoryUsage = stats.memory;
        this.model.OSVersion += stats.os;
        this.model.IpAddress = stats.ip;
      })
    }
    if((typeof getDownloadStats) !== 'undefined'){
      let stats = getDownloadStats();
      this.model.bytesReceived = stats.recieved;
      this.model.transferRate = stats.rate;
    }
    this.model.lastLocation = this.prevLoc;
    if (navigator.geolocation && this.getParameterByName('location')!=='off') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if(position) {
            this.model.Latitude = position.coords.latitude;
            this.model.Longitude = position.coords.longitude;
            this.prevLoc = {latitude: position.coords.latitude, longitude: position.coords.longitude}
          }
        },
      );
    }
    this.final();
  }


  final() {
    let summedStatus = 1;
    for(const val of this.currentStatus) {
      summedStatus+=val;
    }

    if(this.scheduleService.getRegKey() && !this.scheduleService.previewMode) {
      return this.http.post('https://svc1.reveldigital.com/v2/Device/Ping/' + this.scheduleService.decryptKey(this.scheduleService.getRegKey()) +
        '/' + summedStatus + '?format=json', this.model).subscribe((result) => {
      }, (err) => {
        console.log(err);
      });
    }
  }

  getParameterByName(name) {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

