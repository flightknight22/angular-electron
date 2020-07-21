import {Injectable} from '@angular/core';
import timezones from './timezones-array';


@Injectable()
/**
 * @hidden
 * @private
 */
export class TimezoneTranslateService {
  timezone ;

  constructor() {}

  getTimezone(){
    return this.timezone;
  }

  setTimezone(timezone) {
    for(const val of timezones) {
      if(val.value === timezone) {
        this.timezone = val.utc[0];
      }
    }
  }
}
