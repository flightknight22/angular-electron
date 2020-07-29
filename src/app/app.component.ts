import {
  Component,
  ComponentFactoryResolver,
  ViewChild,
  ViewContainerRef,
  HostListener,
  EventEmitter,
  ComponentRef,
  OnDestroy,
  ElementRef,
  ApplicationRef,
  OnInit,
  Injector
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import {Subscription} from "rxjs/Subscription";
import {TemplateComponent} from "./template/template.component";
import {CommandService} from "../providers/command-service";
import {HeartbeatService} from "../providers/heartbeat-service";
import {ScheduleService} from "../providers/schedule-service";
import {SmartScheduleService} from "../providers/smart-schedule-service";
import {TemplateService} from "../providers/template-service";
import {AffidavitService} from "../providers/affidavits-service";
import * as moment from 'moment-timezone';
import {TimezoneTranslateService} from "../providers/timezone-translate-service";
import {PlatformResolverService} from "../providers/platform-resolver-service-public";


import alertSchedule from "./alertSchedule";
import {SettingsService} from "../providers/settings-service";
import {ImpressionService} from "../providers/impression-service";
import {beacon} from "./models/Beacon";
import BeaconRootObject = beacon.BeaconRootObject;
import {command} from "./models/Command";
import CommandRootObject = command.CommandRootObject;
import {affidavitsLog} from "./models/AffidavitsLog";
import AffidavitsLogRootObject = affidavitsLog.AffidavitsLogRootObject;
import {schedule} from "./models/Schedule";
import Device = schedule.Device;
import Schedule = schedule.Schedule;



/**@hidden*/
declare const verifyPackage: any;
/**@hidden*/
declare const writeRegKey: any;
/**@hidden*/
declare const downloadAssets: any;

/**@hidden*/
declare const rebootDevice: any;

/**@hidden*/
declare const BSDeviceInfo: any;


/**@hidden*/
declare const activateFaceAnalytics: any;

/**@hidden*/
declare const keypress: any;



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class Controller implements OnDestroy, OnInit {
  /**@hidden*/
  @ViewChild('dialog', {static: true}) dialog: ElementRef;
  /**@hidden*/
  showSettings = false;
  /**@hidden*/
  settings = false;
  /**@hidden*/
  counter: Observable<any>;
  /**@hidden*/
  scheduleCounter: Observable<any>;
  /**@hidden*/
  smartCounter: Observable<any>;
  /**@hidden*/
  sub: Subscription;
  /**@hidden*/
  sub1: Subscription;
  /**@hidden*/
  sub2: Subscription;
  /**@hidden*/
  sub3: Subscription;
  /**@hidden*/
  sub4: Subscription;
  /**@hidden*/
  smartSub: Subscription;
  /**@hidden*/
  timer = 30;
  /**@hidden*/
  downloading = false;

  /**
   * Use Subscribe format. Will receive https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent on callback.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  onTemplateClicked = new EventEmitter<MouseEvent>();
  /**
   * Use Subscribe format. Will receive [[BeaconRootObject]] on callback.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  onBeaconCallback = new EventEmitter<BeaconRootObject>();
  /**@hidden*/
  currentTemplate: TemplateComponent = null;
  /**@hidden*/
  currentRef:ComponentRef<TemplateComponent> = null;
  /**@hidden*/
  currentTemplateModule:any = null;
  /**@hidden*/
  _currentSchedule: any;
  /**@hidden*/
  countDown = '';
  /**@hidden*/
  loading = true;
  /**@hidden*/
  previewEnded = false;
  /**@hidden*/
  loadingError = null;
  /**@hidden*/
  nothing = false;

  /**@hidden*/
  currentActivationCode:string = null;
  /**@hidden*/
  preview = false;
  /**@hidden*/
  player = {
    version:'1.27'
  };

  /**
   * Use Subscribe format. Will receive [[CommandRootObject]] on callback.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  onCommandCallback = new EventEmitter<CommandRootObject>();
  /**
   * Use Subscribe format. Will receive null on callback.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  onTemplateInitialized = new EventEmitter<null>();// = this.templateService.onTemplateInitialized;
  /**
   * Use Subscribe format. Will receive null on callback.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  onTemplateTerminated = new EventEmitter<null>();// = this.templateService.onTemplateTerminated;
  /**
   * Use Subscribe format. Will receive [[AffidavitsLogRootObject]] on callback.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  onMediaPlayed = new EventEmitter<AffidavitsLogRootObject>();// = this.affidavitService.onMediaPlayed;

  /**@hidden*/
  @ViewChild('container', {read: ViewContainerRef, static: true}) container: ViewContainerRef;

  /**@hidden*/
  @HostListener('click', ['$event']) onClickEvent(event: MouseEvent) {
    this.smartScheduleService.setLastClick(event.clientX, event.clientY);
    this.onTemplateClicked.emit(event);
  }

  //blankImpression = {name:"faceImpression",arg:"[]"};
  //faceImpression = {name:"faceImpression",arg:"[{\"id\":64,\"face\":{\"y\":699,\"x\":591,\"size\":122,\"confidence\":544},\"direction\":{\"yaw\":-14,\"pitch\":18,\"roll\":-18,\"confidence\":1},\"age\":{\"age\":21,\"confidence\":333},\"gender\":{\"gender\":\"female\",\"confidence\":284},\"gaze\":{\"pitch\":-17,\"yaw\":28},\"blink\":{\"left\":374,\"right\":612},\"expression\":{\"neutral\":21,\"happiness\":0,\"surprise\":22,\"anger\":15,\"sadness\":42,\"positive\":-79,\"top_expression\":\"Sadness\"}}]"};

  /**@hidden*/
  constructor(private scheduleService:ScheduleService,
              private smartScheduleService:SmartScheduleService,
              private heartbeatService: HeartbeatService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private commandService: CommandService,
              private templateService:TemplateService,
              private affidavitService: AffidavitService,
              private timezoneTranslateService: TimezoneTranslateService,
              private settingsService: SettingsService,
              public platform:PlatformResolverService,
              public testing:ImpressionService,
              private app: ApplicationRef) {


      let listener = new keypress.Listener();
      // If you want to register a sequence combo
      listener.sequence_combo("m e n u", ()=> {
        console.log('open menu');
        this.toggleSettings();
      }, true);

  }



  rebootSettingsModal(){
    this.dialog.nativeElement.showModal();
    setTimeout(()=>{
      this.reboot();
    },4000)
  }




  /**@hidden*/
  toggleSettings() {
    this.showSettings = this.showSettings !== true;
    if(this.settings==false){
      if(this.settingsService.shouldReboot){
        this.rebootSettingsModal()
      }
    }
  }

  /**@hidden*/
  setPreview() {
    if(!this.preview) {
      this.preview = true;
      let eventTime; // Timestamp - Sun, 21 Apr 2013 13:00:00 GMT
      let currentTime = moment().second(); // Timestamp - Sun, 21 Apr 2013 12:30:00 GMT
      eventTime = currentTime + (10 * 60);
      let diffTime = eventTime - currentTime;
      let duration = moment.duration(diffTime*1000, 'milliseconds');
      let interval = 1000;

      setInterval(()=>{
        duration = moment.duration(duration.asSeconds() - interval, 'milliseconds');

        let secs = duration.seconds().toString();
        if(secs.toString().length!=2){
          secs = '0'+secs.toString()
        }
        this.countDown =  duration.minutes() + ":" + secs ;

        if (duration.asMilliseconds() <= 0) {
          this._currentSchedule = null;
          this.destroyTemplate();
          this.previewEnded = true;
        }
      }, interval);

    }

  }

  /**@hidden*/
  startPackage() {
    this.scheduleService.getLocalSchedule().subscribe((result:any) => {
      try {
        this.initLocalSchedule(result);
      } catch (e) {
        console.log(e);
      }
    }, (err) => {
      console.log(err);
    });
  }

  /**@hidden*/
  activateAlert(args) {
    try {
      let expirationDate;
      if (this.timezoneTranslateService.getTimezone()) {
        expirationDate = moment(JSON.parse(args).ExpiresISO8601).tz(this.timezoneTranslateService.getTimezone()).format("MM/DD/YYYY hh:mm:ss A");
      } else {
        expirationDate = moment(JSON.parse(args).ExpiresISO8601).format("MM/DD/YYYY hh:mm:ss A");
      }

      if (this._currentSchedule) {
        let alertTemplate = JSON.parse(JSON.stringify(alertSchedule.reveldigital.schedule[0]));
        alertTemplate.template.module["0"].option.push({
          "name": "alert-details",
          "value": args
        });
        this._currentSchedule.reveldigital.schedule.unshift(alertTemplate);
      } else {
          this._currentSchedule = alertSchedule;
          this._currentSchedule.reveldigital.schedule["0"].template.module["0"].option.push({
            "name": "alert-details",
            "value": args
          });
      }
      this._currentSchedule.reveldigital.schedule["0"].conditions[0].value1 = expirationDate;
      this._currentSchedule.reveldigital.schedule["0"].conditions[1].value1 = expirationDate;
    } catch (e) {
      console.log(e);
    }


  }


  /**@hidden*/
  activateDevice() {
    if(this.platform.revelDeviceName() !== 'Screensaver') {
      this.sub2 = this.scheduleService.getActivationCode().subscribe(
        (res: any) => {
          this.loadingError = null;
          this.currentActivationCode = res.ActivationCode;
          this.poll(res.EncryptedRegistrationKey);
        },
        (err) => {
          this.loadingError = 'This Player Was Trying To Activate ' + JSON.stringify(err);
          setTimeout(() => {
            this.activateDevice();
          }, 30 * 1000);
        }
      );
    } else {
      if(!localStorage.getItem('activationCode') || !localStorage.getItem('temp key')){
        this.sub2 = this.scheduleService.getActivationCode().subscribe(
          (res: any) => {
            this.loadingError = null;
            this.currentActivationCode = res.ActivationCode;
            localStorage.setItem("activationCode", this.currentActivationCode);
            localStorage.setItem("temp key", res.EncryptedRegistrationKey);
            this.poll(res.EncryptedRegistrationKey);
          },
          (err) => {
            this.loadingError = 'This Player Was Trying To Activate ' + JSON.stringify(err);
            setTimeout(() => {
              this.activateDevice();
            }, 30 * 1000);
          }
        );
      } else {
        this.loadingError = null;
        this.currentActivationCode = localStorage.getItem('activationCode');
        this.poll(localStorage.getItem('temp key'));
      }
    }
  }


  /**@hidden*/
  poll(regKey) {
    this.sub3 = this.scheduleService.getSchedule(regKey).subscribe(
      ()=> {
        if((typeof writeRegKey) !== 'undefined') {
          this.scheduleService.setRegKey(regKey);
          this.commandService.registerChannel();
          writeRegKey(regKey);
        } else {
          localStorage.setItem('registration_key', regKey);
        }
        this.scheduleService.isActivated();
        this.currentActivationCode = null;
        this.newSchedule();
      },
      () => {
        setTimeout(() => {
          this.poll(regKey);
        },1.5*1000);
      }
    );
  }




  /**@hidden*/
  newSchedule() {
    this.nothing = false;
    this.loading = true;
    this.heartbeatService.sendPing();
    console.log('checking for new package');
    if((typeof downloadAssets) !== 'undefined') {
      this.startPackage();
      if((typeof BSDeviceInfo) !== 'undefined'){
        let device_info = new BSDeviceInfo();
        downloadAssets('https://svc1.reveldigital.com/v2/package/get/' + this.scheduleService.decryptKey(this.scheduleService.getRegKey())+'?serialNum='+device_info.deviceUniqueId);
      } else {
        downloadAssets('https://svc1.reveldigital.com/v2/package/get/' + this.scheduleService.decryptKey(this.scheduleService.getRegKey()));
      }
    } else {
      this.sub4 = this.scheduleService.getSchedule().subscribe(
        (data: any) => {
          if (data.status === 200) {
            localStorage.setItem('lastModified', data.headers.get("last-modified"));
            data = data.body;
            if (data && data.reveldigital && data.reveldigital.timezone) {
              let t:any =this.timezoneTranslateService.setTimezone(data.reveldigital.timezone);
              moment.tz.setDefault(t);
            }
            this.loading = false;
            this._currentSchedule = data;
            this.check();
            this.smartSub = this.smartCounter.subscribe(
              () => {
                this.check();
              }
            );
          } else {
            console.log('Data status: ', data.status);
          }

        },
        (err) => {
          this.loading = false;
          this.sub = this.counter.subscribe(
            () => {
              this.loadingError = null;

              this.newSchedule();
              this.sub.unsubscribe();
            }
          );
          this.loadingError = JSON.stringify(err);
        }
      );
    }
  }


  /**@hidden*/
  initLocalSchedule(data) {
    if(data && verifyPackage()) {
      if (data.reveldigital && data.reveldigital.timezone) {
        let t:any =this.timezoneTranslateService.setTimezone(data.reveldigital.timezone);
        moment.tz.setDefault(t);
      }
      this.loading = false;
      this._currentSchedule = data;
      this.check();
      this.smartSub = this.smartCounter.subscribe(
        () => {
          this.check();
        }
      );
    } else {
      console.log('Schedule Not Valid');
    }
  }


  /**@hidden*/
  private checkNormalSchedule(schedule) {
    return this.smartScheduleService.eval([{type: "BeforeTime", sequence: 0, value1: "10/08/2019 "+Controller.formatTime(schedule.endtime), value2: "", value3: "", complement: false, operator: 0, value4: ""},
      {type: "AfterTime", sequence: 1, value1: "10/08/2019 "+Controller.formatTime(schedule.starttime), value2: "", value3: "", complement: false, operator: 0, value4: ""},
      {type: "DaysOfWeek", sequence: 4, value1: schedule.days, value2: "", value3: "", complement: false, operator: 0, value4: ""}])
  }
  /**@hidden*/
  private static formatTime(time){
    time = time.split(':'); // convert to array

// fetch
    const hours = parseInt(time[0]);
    const minutes = parseInt(time[1]);

// calculate
    let timeValue;

    if (hours > 0 && hours <= 12) {
      timeValue= "" + hours;
    } else if (hours > 12) {
      timeValue= "" + (hours - 12);
    } else if (hours == 0) {
      timeValue= "12";
    }

    timeValue += (minutes < 10) ? ":0" + minutes : ":" + minutes;  // get minutes
    timeValue += (hours >= 12) ? ":00 PM" : ":00 AM";  // get AM/PM
    return timeValue;
  }

  /**@hidden*/
  private check() {
    let template = null;
    let commands = null;
    for (let i = 0; i < this._currentSchedule.reveldigital.schedule.length; i++) {

      if ((this._currentSchedule.reveldigital.schedule[i].conditions && this._currentSchedule.reveldigital.schedule[i].conditions.length>0 && this.smartScheduleService.eval(this._currentSchedule.reveldigital.schedule[i].conditions) ||
        (this._currentSchedule.reveldigital.schedule[i].conditions && this._currentSchedule.reveldigital.schedule[i].conditions == 0 && this.checkNormalSchedule(this._currentSchedule.reveldigital.schedule[i])) )
      ) {
        template = this._currentSchedule.reveldigital.schedule[i].template;
        if(this._currentSchedule.reveldigital.schedule[i].playlist) {
          template =  {
            "id": 10000,
              "opaqueid": "playlist",
              "name": "test",
              "groupname": "Examples",
              "width": document.body.clientWidth,
              "height": document.body.clientHeight,
              "orientation": -1,
              "displaymode": 0,
              "script": null,
              "backcolor": "000000",
              "description": null,
              "module": [{
              "id": 1738259,
              "opaqueid": "pf4EJxlzko-8O48KQ8OJlQ",
              "name": "Media Gallery 1",
              "type": "Gallery",
              "left": 0,
              "top": 0,
              "width": document.body.clientWidth,
              "height": document.body.clientHeight,
              "sequence": 0,
              "playlist": this._currentSchedule.reveldigital.schedule[i].playlist,
              "option": []
            }]
          };
        }
        if(this._currentSchedule.reveldigital.schedule[i].commands.length>0) {
          commands = this._currentSchedule.reveldigital.schedule[i].commands;
        }
        break;
      }
    }
    if (template) {
      if (JSON.stringify(template) !== JSON.stringify(this.currentTemplateModule)) {
        if (this.currentTemplate) {
          this.destroyTemplate();
        }
        this.currentTemplateModule = template;
        this.createTemplate(template, true, null);
        this.nothing = false;
        if(commands) {
          this.sendCommand(commands);
        }
      }

    } else {
      this.heartbeatService.removeStatus(this.heartbeatService.removeStatus(4));
      this.nothing = true;
      this.currentTemplateModule = null;
      this.currentTemplate = null;
      this.destroyTemplate();
      if(commands) {
        this.sendCommand(commands);
      }
    }
  }

  /**@hidden*/
  private createTemplate(template, main = true, addClass) {
    const inputProviders = [];
    inputProviders.push({
      provide: 'model',
      useValue: template
    });
    inputProviders.push({
      provide: 'templateService',
      useValue: this.templateService
    });
    inputProviders.push({
      provide: 'sclass',
      useValue: addClass
    });
    // console.log(aclass);
    const injector = Injector.create({providers: inputProviders});
    // const resolvedInputs = ReflectiveInjector.resolve(inputProviders);
    //
    // // We create an injector out of the data we want to pass down and this components injector
    // const injector = ReflectiveInjector.fromResolvedProviders(resolvedInputs, this.container.parentInjector);

    // We create a factory out of the component we want to create
    const factory = this.componentFactoryResolver.resolveComponentFactory(TemplateComponent);

    // We create the component using the factory and the injector
    const component = factory.create(injector);
    // We insert the component into the dom container
    this.container.insert(component.hostView);
    if(main){
      this.currentTemplate = component.instance;
      this.currentRef = component;
    } else {
      return component;
    }
  }


  /**@hidden*/
  destroyTemplate() {
    if(this.currentRef) {
      this.currentRef.destroy();
    }
  }


  /**@hidden*/
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    this.smartScheduleService.setLastKey(event.key);
  }


  /**@hidden*/
  settingsToggle() {
    this.settings = !this.settings;
  }


  /**
   * Reboots device.
   */
  reboot() {
    if((typeof rebootDevice) !== 'undefined') {
      rebootDevice();
    } else {
      window.location.reload();
    }
  }


  /**
   * Currently scheduled template.
   */
  getTemplate(): TemplateComponent {
    return this.currentTemplate;
  }

  /**
   * Returns information related to the device currently running the script.
   */
  getDevice(): Device {
    if(this._currentSchedule) {
      return this._currentSchedule.reveldigital.device as Device;
    }
    return;
  }

  /**
   * Returns the unique identifier (GUID) for this device.
   */
  getDeviceKey():string {
    if(this._currentSchedule) {
      return this._currentSchedule.reveldigital.device.key;
    }
    return;
  }

  /**
   * Current time based on the device time zone.
   */
  getDeviceTime() {
    if(this._currentSchedule) {
      return this._currentSchedule.reveldigital.device.timezone;
    }
    return;
  }

  /**
   * Returns the active schedule or null if nothing is scheduled for the current time.
   */
  getSchedule(): Schedule {
    if(this._currentSchedule) {
      return this._currentSchedule as Schedule;
    }
    return;
  }

  /**
   * Returns the version of the player app.
   */
  getVersionCode() {
   //todo
  }

  /**
   * Sends a command to the Controller.
   */
  sendCommand(command, internal?) {
    this.commandService.sendCommand(command, internal);
  }

  /**
   * Will Reload The Player
   */
  reload() {
    window.location.reload();
  }

  getTimeStats(){
    return {
      time: moment().format(),
      tz: this.getDeviceTime(),
      tzID: this.timezoneTranslateService.getTimezone(),
      tzOffset: this._currentSchedule.reveldigital.utcoffset,
    }
  }


  ngOnDestroy() {
    this.sub.unsubscribe();
    this.smartSub.unsubscribe();
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
    this.sub3.unsubscribe();
    this.sub4.unsubscribe();
  }

  ngOnInit(): void {

    this.onCommandCallback = this.commandService.onReceivedCommand;
    this.onTemplateInitialized = this.templateService.onTemplateInitialized;
    this.onTemplateTerminated = this.templateService.onTemplateTerminated;
    this.onMediaPlayed = this.affidavitService.onMediaPlayed;
    window['player'] = this.player;
    window['moment'] = moment;


    this.settingsService.readSettings().then((settings:any)=>{
      if(settings && settings.general && settings.general["face detection"]){
        if(settings.general["face detection"].enabled){
          activateFaceAnalytics(settings.general["face detection"].rate);
        }
      }
    });


    // setInterval(()=>{
    //   this.sendCommand([{name:"wifiImpression",arg:"wifi|32|2018-12-02T21:15:02Z|c4:93:d9:7d:57:90|4005|-90"}], false)
    // }, 1000);
    // // setInterval(()=>{
    // //   this.sendCommand([this.blankImpression], false)
    // // }, 1000);
    //
    // setInterval(()=>{
    //   this.sendCommand([this.faceImpression], false)
    // }, 1250);

    const assetsDoneCallback = () => {
      console.log('Package Finished Downloading');
      this.downloading = false;
      this.heartbeatService.removeStatus(2);
      this.startPackage();
    };

    const assetsStartedCallback = () => {
      this.downloading = true;
      this.heartbeatService.addStatus(2);
      console.log('Package Starting Downloading');
    };

    const assetsErrorCallback = () => {
      console.log('There Was an Issue Downloading The Package');
      this.downloading = false;
      this.heartbeatService.removeStatus(2);
    };


    // if((typeof assetLoader) !== 'undefined') {
    //   assetLoader.on('done', assetsDoneCallback);
    //   assetLoader.on('started', assetsStartedCallback);
    //   assetLoader.on('error', assetsErrorCallback);
    // }

    window['assetsErrorCallback'] = assetsErrorCallback;
    window['assetsStartedCallback'] = assetsStartedCallback;
    window['assetsDoneCallback'] = assetsDoneCallback;

    localStorage.setItem('lastModified','');
    this.counter = Observable.interval(this.timer*1000);
    this.scheduleCounter = Observable.interval(30*60*1000);
    this.smartCounter = Observable.interval(2*1000);



    window['Controller'] = this;

    this.sub1 = this.commandService.onReceivedCommand.subscribe(
      (command) => {
        // console.log('command', command);
        switch (command.name) {
          case 'getpackage':
            this.newSchedule();
            break;
          case 'reboot':
            this.reboot();
            break;
          case 'truncaffidavit':
            this.affidavitService.truncateDB();
            break;
          case 'sendlog':
            this.affidavitService.sendList();
            break;
          case 'reload':
            this.reload();
            break;
          case 'alert':
            this.activateAlert(this.commandService.getLastCommand().arg);
            break;
          case 'BeaconEnter':
            this.onBeaconCallback.emit(command.arg as BeaconRootObject);
            break;
          default:
            break;
        }
      }
    );

    if(this.scheduleService.isActivated()) {
      this.newSchedule();
    } else {
      this.activateDevice();
    }
  }


}
