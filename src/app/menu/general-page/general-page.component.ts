import {AfterContentInit, Component, ElementRef, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {SettingsService} from "../../../providers/settings-service";
import settingsModel from "../../../providers/settings";
import {AffidavitService} from "../../../providers/affidavits-service";

/**@hidden*/
declare const scanWifi: any;
declare const getNetworkInterfaces: any;
declare const resetPlayer: any;
declare const getSerialDevices: any;
@Component({
  selector: 'app-general-page',
  templateUrl: './general-page.component.html',
  styleUrls: ['./general-page.component.css']
})
export class GeneralPageComponent implements OnInit  {
  @ViewChild('dialog', {static: true}) dialog: ElementRef;
  @ViewChild('wifiDialog', {static: true}) wifiDialog: ElementRef;
  @ViewChild('serialDialog', {static: true}) serialDialog: ElementRef;
  onWillRestartChanged = new EventEmitter<any>();
  wifiScanList = [];
  networks = [];
  paths = [];
  networkInfo = [

  ];
  screenInfo = [
    {name:"Screen Width", value:window.innerWidth+'px', icon:"swap_horiz"},
    {name:"Screen Height", value:window.innerHeight+'px', icon:"swap_vert"}
  ];

  deviceInfo = [

  ];

  currentSettings:any = settingsModel;
  constructor(public settingService:SettingsService, private affidavitService:AffidavitService) {

    if((typeof getSerialDevices) !== 'undefined'){
      getSerialDevices().then((paths)=>{
        this.paths = paths;
      })
    }
    settingService.readSettings().then((settings)=> {
      this.currentSettings = settings;
    });
    settingService.onSettingsChanged.subscribe((settings)=>{
      this.currentSettings = settings;
    })
    if((typeof getNetworkInterfaces) !== 'undefined'){
      this.networks = getNetworkInterfaces();
    }
    for(const nInterface of this.networks){
      this.networkInfo.push(
        {name:`${nInterface.name} IP Address`, value:nInterface.ip, icon:"compare_arrows"},
        {name:`${nInterface.name} Mac Address`, value:nInterface.mac, icon:"dns"})
    }
    this.scanForWifi();
    settingService.onSettingsChanged.subscribe((settings)=> {
      this.currentSettings = settings;
    });
    const timer = setInterval(()=> {
      try {
        if (window["Controller"].getDevice()) {
          clearInterval(timer);
          this.deviceInfo = [{name: "Device Name", value: window["Controller"].getDevice().name, icon: "computer"},
            {name: "Player Version", value: window["Controller"].player.version, icon: "update"},
            {name: "Device Key", value: window["Controller"].getDevice().key, icon: "vpn_key"},
            {name: "Device Type", value: window["Controller"].getDevice().devicetype, icon: "perm_device_information"},
            {name: "Device Timezone", value: window["Controller"].getDevice().timezone, icon: "access_time"}];
        }
      } catch (e) {

      }
    }, 1000);
  }

  scanForWifi(){
    if((typeof scanWifi) !== 'undefined'){
      scanWifi().then(result=>{
        this.wifiScanList = result;
      })
    }
  }

  showWifiDialog() {
    this.wifiDialog.nativeElement.showModal();
  }

  closeWifiDialog() {
    this.wifiDialog.nativeElement.close();
  }

  settingsChange(name, value) {
    try {

      if(value==null) {
        if (this.currentSettings.general.hasOwnProperty(name)) {
          this.currentSettings.general[name] = !this.currentSettings.general[name];
        } else {
          this.currentSettings[this.settingService.getSettingsPlatform()][name] = !this.currentSettings[this.settingService.getSettingsPlatform()][name];
        }
      }
      this.settingService.writeSettings(this.currentSettings);
      this.settingService.onSettingsChanged.emit(this.currentSettings);
      this.settingService.syncSettings({orientation:window["Controller"].getTemplate().getOrientation()}).then(
        result=>{
          console.log(result);
          if(result==true){
            this.settingService.shouldReboot = true;
          }
        }
      )

    } catch (e) {

    }
  }

  ngOnInit() {
  }


  reloadPlayer(){
    window["Controller"].reload();
  }


  clearPlayer() {
    try {
      this.affidavitService.truncateDB();
    } catch (e) {}
    if ((typeof resetPlayer) !== 'undefined') {
      localStorage.clear();
      resetPlayer();
    } else {
      localStorage.clear();
      window['Controller'].reboot();
    }
  }

  showDialog() {
    this.dialog.nativeElement.showModal();
  }

  closeDialog() {
    this.dialog.nativeElement.close();
  }

  showSerialDialog() {
    this.serialDialog.nativeElement.showModal();
  }

  closeSerialDialog() {
    this.serialDialog.nativeElement.close();
  }

}
