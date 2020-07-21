import {EventEmitter, Injectable} from '@angular/core';
import settingsModel from "./settings";
import {PlatformResolverService} from "./platform-resolver-service-public";

/**@hidden*/
declare const readSettingsFile: any;

/**@hidden*/
declare const writeSettingsFile: any;

/**@hidden*/
declare const checkSettings: any;

@Injectable()

export class SettingsService {
  shouldReboot = false;
  constructor(private pltService:PlatformResolverService){

  }
  onSettingsChanged = new EventEmitter<any>();

  readSettings() {
    return new Promise((resolve)  => {
      if((typeof readSettingsFile) !== 'undefined') {
        readSettingsFile().then((settings) => {
          resolve(this.isValidSettings(settings));
        });
      } else {
        resolve(this.isValidSettings(localStorage.getItem("settings")));
      }
    });
  }

  writeSettings(settings) {
    if((typeof writeSettingsFile) !== 'undefined') {
      writeSettingsFile(JSON.stringify(settings));
    } else {
      localStorage.setItem('settings', JSON.stringify(settings));
    }
    this.onSettingsChanged.emit(settings);
  }


  isValidSettings(settings) {
    try {
      if(settings) {
        return JSON.parse(settings);
      }
    } catch (e) {
      this.writeSettings(settingsModel);
      return settingsModel;
    }
    this.writeSettings(settingsModel);
    return settingsModel;
  }


  syncSettings(options){
    //returns true if settings were changed and needs reboot
    return new Promise((resolve, reject)=>{
      if((typeof checkSettings) !== 'undefined'){
          this.readSettings().then(settings=>{
            console.log('read settings and checking');
          resolve(checkSettings(settings, options));
        });
      } else {
        resolve(false);
      }
    });

  }

  getSettingsPlatform(){
    return this.pltService.getPlatformInfo().name.toLowerCase();
  }

  settingAvailable(setting){
    let plt = this.getSettingsPlatform();
    for (const key in settingsModel.general) {
      if (settingsModel.general.hasOwnProperty(key) && key===setting) {
        return true;
      }
    }
    if(settingsModel.hasOwnProperty(plt)) {
      for (const key in settingsModel[plt]) {
        if (settingsModel[plt].hasOwnProperty(key) && key === setting) {
          return true;
        }
      }
      for (const key in settingsModel[plt].check) {
        if (settingsModel[plt].check.hasOwnProperty(key) && key === setting) {
          return true;
        }
      }
    }

    return false;
  }

}
