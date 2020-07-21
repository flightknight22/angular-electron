import {EventEmitter, Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ScheduleService} from "./schedule-service";
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import {Subscription} from "rxjs/Subscription";
import {affidavitsLog} from "../app/models/AffidavitsLog";
import AffidavitsLogRootObject = affidavitsLog.AffidavitsLogRootObject;




@Injectable()

export class AffidavitService implements OnDestroy {

  private db: IDBDatabase;
  onMediaPlayed = new EventEmitter<AffidavitsLogRootObject>();
  mediaList = [];
  objectStore: IDBObjectStore;
  logStack = [];
  timer: Observable<any>;
  sub: Subscription;
  constructor(private http: HttpClient, private scheduleService:ScheduleService) {

    if (!window.indexedDB) {
     console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
    } else {
      const request = window.indexedDB.open('media', 2);
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
        this.db.createObjectStore("log", {keyPath: 'id', autoIncrement: false});
        this.objectStore.createIndex('fileId', 'fileId', {unique: false});
        this.objectStore.createIndex('duration', 'duration', {unique: false});
        this.startTimer();
      };
    }
  }

  startTimer() {
    this.timer = Observable.interval(30*60*1000);
    this.sub = this.timer.subscribe(
      () => {
        this.createEntryList();
      },(err)=> {
        console.log(err);
      });
  }


  stopTimer() {
    this.sub.unsubscribe();
  }

  mediaPlayed(media) {
    if (media.fileid) {

      this.onMediaPlayed.emit(media as AffidavitsLogRootObject);
      if (this.db) {
        const transaction = this.db.transaction(["log"], "readwrite");
        const objectStore = transaction.objectStore("log");
        const request = objectStore.add({fileId: media.fileid, id: new Date().toISOString(), duration: Math.round(media.duration/1000)});
        this.logStack.forEach((log) => {
          objectStore.add(log);
          this.logStack.splice(this.logStack.indexOf(log), 1);
        });
        request.onsuccess = function (event: any) {
        };
        request.onerror = (evt) => {
          console.log(evt);
        };
      } else {
        this.logStack.push({fileId: media.fileid, id: new Date().toISOString(), duration: media.duration});
      }
    }
  }



    deleteList() {
      for(const val of this.mediaList) {
        const objectStoreRequest = this.db.transaction(["log"], "readwrite")
          .objectStore("log")
          .delete(val.Timestamp);
        /*
        objectStoreRequest.onsuccess = function(event) {
          console.log('deleted')
        };
        objectStoreRequest.onerror = function(event) {
          console.log('not deleted')
        };
        */
      }
      this.mediaList=[];
    }

    sendList() {
      this.createEntryList();
    }

    truncateDB() {
      const transaction = this.db.transaction(["log"], "readwrite");
      const objectStore = transaction.objectStore("log");
      const request = objectStore.clear();
      request.onsuccess = function (event: any) {
      };
      request.onerror = (evt) => {
        console.log(evt);
      };
    }

  createEntryList() {
    const objectStore = this.db.transaction("log").objectStore("log");
    objectStore.openCursor().onsuccess = (event:any) => {
      const cursor = event.target.result;
      if(cursor  && this.mediaList.length<5000) {
        this.mediaList.push({Timestamp:cursor.value.id, FileId:cursor.value.fileId, Duration:cursor.value.duration});
        cursor.continue();
      } else {

        if(this.mediaList.length>0 && !this.scheduleService.previewMode) {
          this.http.post(`https://svc1.reveldigital.com/device/affidavit/create/${this.scheduleService.decryptKey(this.scheduleService.getRegKey())}`
            ,{Affidavits:this.mediaList},{headers:{
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                "X-RevelDigital-PlayerVersion": window['player'].version
              }
            }).subscribe(
            ()=> {
              console.log('affidavits posted');
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




  ngOnDestroy() {
    this.sub.unsubscribe();
  }


}
