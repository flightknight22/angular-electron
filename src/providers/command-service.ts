import {EventEmitter, Injectable} from '@angular/core';
import {ScheduleService} from "./schedule-service";
import {SettingsService} from "./settings-service";
import {ImpressionService} from "./impression-service";
import Pusher from 'pusher-js';
import {command} from "../app/models/Command";
import CommandRootObject = command.CommandRootObject;



declare const sendSyncCommand: any;




@Injectable()

export class CommandService {

  /***
   * copilotInfo is specific to init project
   ***/
  private _copilotInfo = null;
  onReceivedCommand = new EventEmitter<CommandRootObject>();
  lastCommand = null;
  isRegistered = false;
  pusher;
  shouldSync = false;
  serialEnabled = false;
  currentCoordinates = null;


  constructor(public scheduleService:ScheduleService, private settingService:SettingsService, private impressionService: ImpressionService) {
    settingService.readSettings().then((settings:any)=> {
      if(settings[this.settingService.getSettingsPlatform()]) {
        this.serialEnabled = settings[this.settingService.getSettingsPlatform()]["serial"];
        this.shouldSync = settings[this.settingService.getSettingsPlatform()]["network sync"];
      }
    });
    settingService.onSettingsChanged.subscribe((settings:any)=> {
      const temp = settings[this.settingService.getSettingsPlatform()];
      if(temp) {
        if(temp.hasOwnProperty('serial')) {
          this.serialEnabled = settings[this.settingService.getSettingsPlatform()]["serial"];
        }
        if(temp.hasOwnProperty('network sync')) {
          this.shouldSync = settings[this.settingService.getSettingsPlatform()]["network sync"];
        }
      }
    });
    if((typeof Pusher) !== 'undefined') {
      //Pusher.logToConsole = true;
      this.pusher = new Pusher('a927dc009c8976d11459', {
        cluster: 'us2',
        encrypted: true
      });
      // console.log('pusher', this.scheduleService.getRegKey());
      this.registerChannel();
    }
  }

  registerChannel() {
    // console.log('register channel');
    if(this.scheduleService.getRegKey() && !this.isRegistered) {
      this.isRegistered = true;
      if(this.scheduleService.getRegKey()) {
        const channel = this.pusher.subscribe(this.scheduleService.decryptKey(this.scheduleService.getRegKey()));

        channel.bind('command', (data) => {

          this.processCommands(data);
        });
      }
      // this.pusher.connection.bind('state_change', function(states) {
      //   // console.log(states);
      // });
    } else {
      setTimeout(()=> {this.registerChannel();},5000);
    }
  }

  processCommands(data, internal?) {
    for (const val of data) {
      if(val.name==='synchronize') {
        if(!internal) {
          this.lastCommand = val;
          if((typeof sendSyncCommand) !== 'undefined') {
            sendSyncCommand(val.arg);
          } else {
            console.log('Sync Command not sent. This platform may not support network sync');
          }
        } else if(this.shouldSync) {
          this.lastCommand = val;
          console.log(`UDP Sync Received: ${val.arg}`);
          this.onReceivedCommand.emit(val as CommandRootObject);
        }
      } else if(val.name==='serial') {
         if(this.serialEnabled) {
           this.lastCommand = val;
           this.onReceivedCommand.emit(val as CommandRootObject);
         }
      } else if(val.name==='faceImpression') {
        this.impressionService.newFaceImpression(val)
      }
      else if(val.name==='wifiImpression') {
        this.impressionService.newWifiImpression(val)
      }
      else {
        this.lastCommand = val;
        this.onReceivedCommand.emit(val as CommandRootObject);
      }
      if(val.name==='gps-location') {
        this.currentCoordinates = JSON.parse(val.arg).location;
      }
    }
  }

  getLastCommand() {
    return this.lastCommand;
  }

  sendCommand(command, internal?) {
    this.processCommands(command, internal);
  }





}
