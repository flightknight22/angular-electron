import {EventEmitter, Injectable, OnDestroy} from '@angular/core';
import {Impression} from "../app/interfaces/impression";
import {IGenderType} from "../app/interfaces/genderType";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import 'rxjs/add/observable/interval';
import {Subscription} from "rxjs/Subscription";
import {ScheduleService} from "./schedule-service";
import * as moment from 'moment-timezone';
import * as uuid from 'uuid';




@Injectable()



export class ImpressionService implements OnDestroy {

  private db: IDBDatabase;
  objectStore: IDBObjectStore;
  onImpressionCallback = new EventEmitter<[FaceImpression]>();
  onWifiImpressionCallback = new EventEmitter<[WifiImpression]>();
  impressions = [];
  impressionList = [];
  wifi = [];
  pendingDelete = [];
  timer: Observable<any>;
  sub: Subscription;
  authToken = "Revel:RPcoOV6D3b9HTcm8KU8utdraPTNj2hwmVTk+iWXA8+Jdf4tiHtyVoh4NN/EYJyrdh2oHu76qDcyZ7w7x52/65uksQNdXuP7VpNG0zoHqv7nwZVvrFB8Mh0IfLIFmBTXAQN9YWGQ1bM7LLdbQdOCK7xwcmwhWArkUFpqdzq41yPcBFPH6fk194CK4ce9VF9QXWqoT9YL98cF3TyX/rU1aTppB2ROUBOb/XISje2BtkfYK6hRewnR7Bw/3f8oqSQJDn0mgco8TVrS3CDF5Pdqan07W88ycrcs0Ar14Y3GcZyQRH52JFvMmAFp1tX9YQx910xcZ3kl76BxX/nUU6q758g==";

  constructor(private http: HttpClient, private scheduleService:ScheduleService) {
    if (!window.indexedDB) {
      console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
    } else {
      const request = window.indexedDB.open('impressionlog', 2);
      request.onerror = (event) => {
        console.log("permission for IndexedDB was denied?!");
      };
      request.onsuccess = (event:any) => {
        this.db = event.target.result;
        this.startTimer();
      };
      request.onupgradeneeded = (event:any) => {
        // Save the IDBDatabase interface
        this.db = event.target.result;
        this.db.createObjectStore("impressionlog", {keyPath: 'id', autoIncrement: false});
        this.objectStore.createIndex('impressionId', 'impressionId', {unique: false});
        this.objectStore.createIndex("firstSeen", "firstSeen", { unique: false });
        this.objectStore.createIndex("lastSeen", "lastSeen", { unique: false });
        this.objectStore.createIndex("ping_type", "ping_type", { unique: false });
        this.objectStore.createIndex("event_type", "event_type", { unique: false });
        this.objectStore.createIndex("gender", "gender", { unique: false });
        this.objectStore.createIndex("name", "name", { unique: false });
        this.objectStore.createIndex("birth_date", "birth_date", { unique: false });
        this.objectStore.createIndex("dwell", "dwell", { unique: false });
        this.objectStore.createIndex("smile", "smile", { unique: false });
        this.objectStore.createIndex("user_id", "user_id", { unique: false });

        this.startTimer();
      };
    }

  }

  //fix smile, unique id for face, mac for id

  startTimer() {
    this.createEntryList();
    this.timer = Observable.interval(30*60*1000);
    this.sub = this.timer.subscribe(
      () => {
        this.createEntryList();
      },(err)=> {
        console.log(err);
      });

    let faceImpressionChecker = Observable.interval(10*1000);
    faceImpressionChecker.subscribe(()=>{
      for(const index in this.impressions){
        if((Date.now()-this.impressions[index].lastSeen)/1000>10){
          this.notifyDB(this.impressions[index],64);
          this.impressions.splice(parseInt(index, 10), 1);
        }
      }
    })
  }

  notifyDB(record, pingtype){
    if (this.db) {
      const transaction = this.db.transaction(["impressionlog"], "readwrite");
      // const objectStore = transaction.objectStore("impressionlog");
      this.insertDB(record, pingtype, record.firstSeen, record.lastSeen);
      //const objectStoreRequest = objectStore.get(record.getTrackingId());
      // objectStoreRequest.onsuccess = (event)=> {
      //   if(objectStoreRequest.result){
      //     this.insertDB(record, pingtype, objectStoreRequest.result.firstSeen);
      //   } else {
      //     if(record.hasOwnProperty('getTimestamp')){
      //       //is wifi impression
      //
      //     } else {
      //       this.insertDB(record, pingtype, new Date().toISOString());
      //     }
      //   }
      //
      // };

    }
  }

  insertDB(record:Impression, pingtype, initTimestamp, lastSeen){
    const transaction = this.db.transaction(["impressionlog"], "readwrite");
    const objectStore = transaction.objectStore("impressionlog");
    const request = objectStore.put({
      id: record.getTrackingId(),
      ping_type: this.guardUndefined(pingtype),
      event_type: this.guardUndefined(record.getEventType()),
      firstSeen: this.guardUndefined(initTimestamp),
      lastSeen: this.guardUndefined(lastSeen),
      gender: this.guardUndefined(record.getGender()),
      birth_date: this.guardUndefined(this.calcBirthday(record.getAge())),
      name: this.guardUndefined(record.getName()),
      dwell: this.guardUndefined(record.getTrackingTime()),
      smile: this.guardUndefined(record.getSmile()),
      user_id: this.guardNoID(record.getUserID())
    });
    request.onsuccess = function (event: any) {
    };
    request.onerror = (evt) => {
      console.log(evt);
    };
  }


  guardUndefined(val){
    if(typeof val !== 'undefined') return val;
    return null;
  }
  guardNoID(val){
    if(typeof val !== 'undefined' && val) return val;
    return uuid.v4();
  }

  calculatePctByAge(start:number, end:number){
    let cnt = 0;
    for(const val of this.impressions){
      if(val.age>=start && val.age<=end) cnt++;
    }
    return cnt/this.calculateTotalViewers()*100;
  }

  calculateTotalViewers(){
    return this.impressions.length;
  }

  calculatePctByGender(gender:Gender){
    let cnt = 0;
    for(const val of this.impressions){
      if(val.gender === gender) cnt++;
    }
    return cnt/this.calculateTotalViewers()*100;
  }

  createEntryList() {
    const objectStore = this.db.transaction("impressionlog").objectStore("impressionlog");
    objectStore.openCursor().onsuccess = (event:any) => {

      const cursor = event.target.result;
      if(cursor  && this.impressionList.length<5000) {
        let val = cursor.value;

        if(!val.dwell) {
          this.impressionList.push({
            timestamp: this.dateFormat(new Date(val.firstSeen)),
            ping_type: 16+64,
            user: {
              name: val.name,
              gender: this.capitilize(new GenderType().fromInteger(val.gender)),
              birth_date: val.birth_date
            },
            dwell: 0,
            smile: val.smile,
            user_id: val.id,
            rssi: 0
          });
          this.impressionList.push({
            timestamp: this.dateFormat(new Date(val.firstSeen)),
            ping_type: 32+64,
            user: {
              name: val.name,
              gender: this.capitilize(new GenderType().fromInteger(val.gender)),
              birth_date: val.birth_date
            },
            dwell: val.lastSeen - val.firstSeen,
            smile: val.smile,
            user_id: val.id,
            rssi: 0
          });
        } else {
          this.impressionList.push({
            timestamp: val.firstSeen,
            ping_type: val.event_type+256,
            user: {
              name: val.name,
              gender: this.capitilize(new GenderType().fromInteger(val.gender)),
              birth_date: val.birth_date
            },
            dwell: val.dwell,
            smile: val.smile,
            user_id: val.id,
            rssi: 0
          });
        }
        this.pendingDelete.push(val.id);
        cursor.continue();
      } else {
        if(this.impressionList.length>0 && !this.scheduleService.previewMode) {
          this.http.post(`https://svc1.reveldigital.com/beacon/ping/${this.scheduleService.decryptKey(this.scheduleService.getRegKey())}`
            ,this.impressionList,{headers:{
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                "Authorization": this.authToken,
                "X-RevelDigital-PlayerVersion": window['player'].version
              }
            }).subscribe(
            ()=> {
              console.log('impressions posted');
              this.deleteList();
            },
            (err)=> {
              console.log(err);
            }
          );
        }

      }
    };
  }

  dateFormat(date){
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }


      return date.getUTCFullYear() +
        '-' + pad(date.getUTCMonth() + 1) +
        '-' + pad(date.getUTCDate()) +
        'T' + pad(date.getUTCHours()) +
        ':' + pad(date.getUTCMinutes()) +
        ':' + pad(date.getUTCSeconds()) +
        '.' + (date.getUTCMilliseconds() / 1000).toFixed(2).slice(2, 5) +
        'Z';

  }


  calcDwell(a, b){
    return moment(b).diff(moment(a));
  }

  calcBirthday(age:number){
    if(age<0 || age===null) return null;
    return moment.utc().startOf('day').subtract(age, "years").format('YYYY-MM-DDTHH:mm:ss.S')+'Z';
  }

  capitilize(string) {
    string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  sendList() {
    this.createEntryList();
  }

  deleteList() {
    for(const val of this.pendingDelete) {
      const objectStoreRequest = this.db.transaction(["impressionlog"], "readwrite")
        .objectStore("impressionlog")
        .delete(val);
      /*
      objectStoreRequest.onsuccess = function(event) {
        console.log('deleted')
      };
      objectStoreRequest.onerror = function(event) {
        console.log('not deleted')
      };
      */
    }
    this.impressionList = [];
    this.pendingDelete = [];
  }

  newFaceImpression(command){
    try {
      const tmpArray:any = [];
      const rawArray = JSON.parse(command.arg);
      for(const val of rawArray){
        let face = new FaceImpression(val.age, val.blink, val.gender.toLowerCase(), parseFloat(val.happiness), val.id, val.extra);
        tmpArray.push(face);
        let foundFace = false;
        for(let val of this.impressions){
          if(val.id == face.id){
            foundFace = true;
            val.updateImprression();
          }
        }
        if(!foundFace){
          this.impressions.push(face);
          this.notifyDB(face,64)
        }
      }

      //this.impressions
      this.onImpressionCallback.emit(tmpArray);
    } catch (e) {
      console.log(e)
    }
  }

  newWifiImpression(command){
    try {
      const patternMatch = new RegExp("^wifi\\|(\\d*)\\|(.*)\\|(.*)\\|(\\d*)\\|(-?\\d*)$");
      const groups = patternMatch.exec(command.arg);
      //if(gr)
      let device = new WifiImpression(groups[3], groups[5], parseInt(groups[4], 10) ,moment.utc().format('YYYY-MM-DDTHH:mm:ss.SS')+'Z', parseInt(groups[1], 10));
      this.notifyDB(device,256+parseInt(groups[1],10));
      this.onWifiImpressionCallback.emit([device]);

    } catch (e) {
      console.log(e);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }


}

class WifiImpression implements Impression{
  mac:string;
  rssi:number;
  dwell:number;
  timestamp:string;
  ping_type:number;
  constructor(mac, rssi, dwell, timestamp, ping_type){
    this.mac = mac;
    this.rssi = rssi;
    this.dwell = dwell;
    this.timestamp = timestamp;
    this.ping_type = ping_type;
  }

  getMacAddress(){
    return this.mac;
  }

  getRssiValue(){
    return this.rssi;
  }

  getDwellTime(){
    return this.dwell;
  }


  getTimestamp(){
    return this.timestamp;
  }

  getAge() {
    return null;
  }

  getBlink() {
    return null;
  }

  getGender() {
    return null;
  }

  getSmile() {
    return null;
  }

  getTrackingId() {
    return this.mac;
  }

  getTrackingTime() {
    return this.dwell;
  }

  getName() {
    return null;
  }

  getUserID() {
    return this.mac;
  }

  getEventType() {
    return this.ping_type;
  }




}

class FaceImpression implements Impression{
  age:number;
  blink:boolean;
  smile:number;
  id:number;
  gender:number;
  lastSeen:number;
  firstSeen:number;
  //trackingTime:number;
  raw;


  constructor(age, blink, gender, smile, id, raw){
    this.age = age;
    this.blink = blink;
    this.gender = new GenderType().fromString(gender);
    this.smile = smile;
    this.id = id;
    this.raw = raw;
    this.lastSeen = Date.now();
    this.firstSeen = Date.now();
  }

  getAge():number {
    return this.age;
  }

  getBlink():boolean {
    return this.blink;
  }

  getGender():number {
    return this.gender;
  }

  getSmile():number {
    return this.smile;
  }

  getTrackingId() {
    return this.id;
  }

  getTrackingTime() {
    return Math.round((this.raw.lastSeen-this.raw.enter)/1000);
  }

  getRawData(){
    return this.raw;
  }

  getName() {
    return null;
  }

  getUserID() {
    return null;
  }

  getEventType() {
    return null;
  }

  updateImprression(){
    this.lastSeen = Date.now();
  }

  isExpired(){
    return (Date.now() - this.lastSeen)/1000>10;
  }

}

export class GenderType implements IGenderType{

  gender: Gender;

  constructor(){

  }


  fromInteger(x: number) {
    if(x === 0){
      return 'FEMALE';
    } else if(x === 1){
      return 'MALE';
    } else{
      return 'UNKNOWN';
    }
  }

  fromString(x: string) {
    if(x.toLowerCase()==='female'){
      return 0;
    } else if(x.toLowerCase()==='male') {
      return 1;
    } else {
      return 2
    }
  }

  valueOf(x: string){
    if(x.toLowerCase()==='female'){
      return 'FEMALE';
    } else if(x.toLowerCase()==='male') {
      return 'MALE';
    } else {
      return 'UNKNOWN'
    }
  }

  values() {
    return ["FEMALE","MALE","UNKNOWN"]
  }


}

enum Gender {
  FEMALE,
  MALE,
  UNKNOWN
}
