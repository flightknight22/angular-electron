import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {PlatformResolverService} from "./platform-resolver-service-public";
import {Observable} from "rxjs/Observable";
import * as forge from 'node-forge';

declare const getSerialKey: any;
declare const getRegKey: any;
declare const BSDeviceInfo: any;
declare const getClaimID: any;

@Injectable()


export class ScheduleService {
  registration_key:string = null;
  previewMode = false;
  publicKey = `-----BEGIN PUBLIC KEY-----
    MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCq94CwVhbluPoPb0Sm1lf/yNfc
    mDLKYFvMUvJhGkVyzBGAThH5FyrWFlm6bX6wd77OrtE5qJZOR0YdD0Noq+Yhd4JE
    kgTaPlmwm/2Wz/aEN+FXQW1ifitymARggAVOkOQEJu7xCL+cztZRxOO/XUuYWeND
    DiEpyoQbd207il0XtQIDAQAB
    -----END PUBLIC KEY-----`;


  constructor(private http: HttpClient, private platform:PlatformResolverService) {}

  setRegKey(key) {
    this.registration_key = key;
  }

  isActivated() {
    this.registration_key = this.getRegKey();
    return this.registration_key !== null;
  }


  getSchedule(regKey?, lastModified?): Observable<HttpResponse<any>>  {
    if(!regKey) {
      regKey = this.registration_key;
    }
    if(!lastModified) {
      lastModified = '';
    }


    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'If-Modified-Since': lastModified
      })

    };
    if((typeof BSDeviceInfo) !== 'undefined'){
      let device_info = new BSDeviceInfo();
      return this.http.get('https://svc1.reveldigital.com/v2/device/schedule/get/'+this.decryptKey(regKey)+'?format=json'+'&serialNum='+device_info.deviceUniqueId,
        {headers:httpOptions.headers, observe: 'response'});
    } else if((typeof getSerialKey) !== 'undefined'){
      return this.http.get('https://svc1.reveldigital.com/v2/device/schedule/get/'+this.decryptKey(regKey)+'?format=json'+'&serialNum='+getSerialKey(),
        {headers:httpOptions.headers, observe: 'response'});
    }
    return this.http.get('https://svc1.reveldigital.com/v2/device/schedule/get/'+this.decryptKey(regKey)+'?format=json',
      {headers:httpOptions.headers, observe: 'response'});
  }

  getLocalSchedule() {
   return this.http.get(this.platform.getPackageLocation()+'reveldigital.json');
  }

  getActivationCode() {
    let claimId = '';
    if((typeof getClaimID) !== 'undefined' && getClaimID()){
      claimId = `&claimId=${getClaimID()}`
    }
    if((typeof BSDeviceInfo) !== 'undefined'){
      let device_info = new BSDeviceInfo();
      return this.http.get('https://svc1.reveldigital.com/device/activation/get?format=json&deviceTypeId='+this.platform.revelDeviceName()+'&serialNum='+device_info.deviceUniqueId+claimId);
    } else if((typeof getSerialKey) !== 'undefined'){
      return this.http.get('https://svc1.reveldigital.com/device/activation/get?format=json&deviceTypeId='+this.platform.revelDeviceName()+'&serialNum='+getSerialKey()+claimId);
    }
    return this.http.get('https://svc1.reveldigital.com/device/activation/get?format=json&deviceTypeId='+this.platform.revelDeviceName()+claimId);
  }


  getRegKey() {
    let regKey:string = null;
    if(!this.registration_key) {
      if((typeof getRegKey) !== 'undefined') {
        regKey = getRegKey();
      }
      else if(this.getParameterByName('key')) {
        regKey = this.getParameterByName('key');
        this.previewMode = true;
        setInterval(()=>{
            window['Controller'].setPreview();

        }, 1000)

      }
      else {
        regKey = localStorage.getItem('registration_key');
      }
    } else {
      regKey = this.registration_key;
    }
    if(!regKey){
      return null;
    }
    return regKey;
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

  decryptKey(key){
    try{
      return forge.pki.rsa.decrypt(forge.util.decode64(key), forge.pki.publicKeyFromPem(this.publicKey), true, true);
    }catch (e) {
      console.log('decryption failed');
      return null
    }
  }


}
