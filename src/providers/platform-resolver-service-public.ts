import {Injectable} from '@angular/core';
import platforms from './platforms';


/**@hidden*/
declare const getPlatformName;
/**@hidden*/
declare const getPackagePath;


@Injectable()

export class PlatformResolverService {

  currentPlatfromInfo: any;
  /**@hidden*/
  constructor() {

    if((typeof getPlatformName) !== 'undefined') {
      this.currentPlatfromInfo = platforms[getPlatformName()];
    } else {
      this.currentPlatfromInfo = platforms['web'];
    }
  }

  getPlatformInfo() {
    return this.currentPlatfromInfo;
  }

  getPath() {
    if((typeof getPackagePath) !== 'undefined') {
      return getPackagePath()+'Media/';
    } else {
      return this.currentPlatfromInfo.packageMediaLocation;
    }

  }

  getPackageLocation() {
    if((typeof getPackagePath) !== 'undefined') {
      return getPackagePath();
    } else {
      return this.currentPlatfromInfo.packageLocation;
    }
  }

  getAssetsPath() {
    return this.currentPlatfromInfo.assetsLocation;
  }
  revelDeviceName() {
    return this.currentPlatfromInfo.revelDeviceName;
  }
  isCaseSensitive() {
    return this.currentPlatfromInfo.caseSensitive;
  }
  isSpaceSensitive() {
    return this.currentPlatfromInfo.spaceSensitive;
  }
  localStorageAvailable() {
    return this.currentPlatfromInfo.localStorageAvailable;
  }
}

