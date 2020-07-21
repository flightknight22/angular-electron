import {Injectable} from '@angular/core';
import * as moment from 'moment-timezone';
import {CommandService} from "./command-service";
import {TimezoneTranslateService} from "./timezone-translate-service";
import {GenderType, ImpressionService} from "./impression-service";
import * as geolib from 'geolib';
import * as SunCalc from 'suncalc';
@Injectable()

export class SmartScheduleService {

  lastKey = '';
  lastClick = {x:-100,y:-100};

  constructor(private commandService: CommandService, private timezoneTranslateService: TimezoneTranslateService, private impressionServcie: ImpressionService) {
  }

  setLastKey(key) {
    this.lastKey = key;
  }


  setLastClick(x, y) {
    this.lastClick = {x:x,y:y};
  }

  eval(conditions) {

    if(this.timezoneTranslateService.getTimezone()){
      moment.tz.setDefault(this.timezoneTranslateService.getTimezone());
    }
    let last = true;
    const now = moment();
    // for day and night time command
    // if(this.commandService.currentCoordinates){
    //   let sunInfo = SunCalc.getTimes(/*Date*/ now.toDate(), /*Number*/ this.commandService.currentCoordinates.latitude, /*Number*/ this.commandService.currentCoordinates.longitude);
    //   console.log(sunInfo.sunrise, sunInfo.sunset);
    // }
    if (conditions) {
      for (const c of conditions) {
        let curr = false;
        if ("AfterDate" === c.type) {
          curr = moment.duration(now.diff(c.value1)).asHours() > 0;
        } else if ("AfterTime" === c.type) {
          const beginningTime = moment(c.value1.split(' ')[1] + c.value1.split(' ')[2], 'h:mm:sA');
          const endTime = moment(moment().format('h:mm:sA'), 'h:mm:sA');
          curr = endTime.isAfter(beginningTime);
        } else if ("Always" === c.type) {
          curr = true;
        }  else if ("KeyEvent" === c.type) {
          curr = c.value1 === this.lastKey;
        } else if ("TouchEvent" === c.type) {
          curr = c.value1 < this.lastClick.x && this.lastClick.x < c.value3 && c.value2 < this.lastClick.y && this.lastClick.y < c.value4;
        } else if ("Never" === c.type) {
          curr = false;
        } else if ("BeforeDate" === c.type) {
          curr = moment.duration(now.diff(c.value1)).asHours() <= 0;
        } else if ("BeforeTime" === c.type) {
          const beginningTime = moment(c.value1.split(' ')[1] + c.value1.split(' ')[2], 'h:mm:sA');
          const endTime = moment(moment().format('h:mm:sA'), 'h:mm:sA');
          curr = endTime.isBefore(beginningTime);
        } else if ("DateRange" === c.type) {
          let range = true;
          if (c.value1) {
            range = now.isAfter(c.value1);
          }
          if (c.value2) {
            range = range && now.isBefore(c.value2);
          }
          curr = range;
        } else if ("TimeRange" === c.type) {
          let range = true;
          if (c.value1) {
            const beginningTime = moment(c.value1.split(' ')[1] + c.value1.split(' ')[2], 'h:mm:sA');
            const endTime = moment(moment().format('h:mm:sA'), 'h:mm:sA');
            range = endTime.isAfter(beginningTime);
          }
          if (c.value2) {
            const beginningTime = moment(c.value2.split(' ')[1] + c.value2.split(' ')[2], 'h:mm:sA');
            const endTime = moment(moment().format('h:mm:sA'), 'h:mm:sA');
            range = range && endTime.isBefore(beginningTime);
          }
          curr = range;
        } else if ("DayOfMonth" === c.type) {
          curr = moment().format('D') === c.value1;
        } else if ("NotDayOfMonth" === c.type) {
          curr = moment().format('D') !== c.value1;
        } else if ("MonthOfYear" === c.type) {
          curr = moment().format('M') === c.value1;
        } else if ("NotMonthOfYear" === c.type) {
          curr = moment().format('M') !== c.value1;
        } else if ("WeekOfYear" === c.type) {
          curr = moment().week().toString() === c.value1;
        } else if ("NotWeekOfYear" === c.type) {
          curr = moment().week().toString() !== c.value1;
        } else if ("WeekOfMonth" === c.type) {
          curr = c.value1 === Math.ceil(moment().date() / 7);
        } else if ("NotWeekOfMonth" === c.type) {
          curr = c.value1 !== Math.ceil(moment().date() / 7);
        } else if ("DaysOfWeek" === c.type) {
          const day = 1 << moment().day();
          curr = (c.value1 & day) !== 0;
        } else if ("Command" === c.type) {
          curr = false;
          const lastCommand = this.commandService.getLastCommand();
          if (lastCommand && lastCommand.hasOwnProperty('name')) {
            if (lastCommand.name === c.value1) {
              if (c.value2) {
                if (lastCommand.hasOwnProperty('arg') && lastCommand.arg.toString() === c.value2) {
                  curr = true;
                }
              } else {
                curr = true;
              }
            }
          }
        }
        else if ("GpsWithinRadius" === c.type) {
          if(this.commandService.currentCoordinates) {
            try {
              console.log(geolib.getDistance({
                  latitude: c.value1,
                  longitude: c.value2
                }, this.commandService.currentCoordinates)
                * 0.0006213712, {latitude: c.value1, longitude: c.value2}, this.commandService.currentCoordinates);
              curr = geolib.getDistance({
                  latitude: c.value1,
                  longitude: c.value2
                }, this.commandService.currentCoordinates)
                * 0.0006213712 <= c.value3;
            } catch (e) {
              curr = false;
            }
          } else {
            curr = false;
          }
          //curr = (this.impressionServcie.calculatePctByGender(0) >= c.value1);
        }
        else if ("TotalViewersLessThan" === c.type) {
          curr = this.impressionServcie.calculateTotalViewers() < c.value1;
        } else if ("TotalViewersGreaterThan" === c.type) {
          curr = this.impressionServcie.calculateTotalViewers() > c.value1;
        } else if ("PctChild" === c.type) {
          curr = (this.impressionServcie.calculatePctByAge(0, 5) >= c.value1);
        } else if ("PctYoung" === c.type) {
          curr = (this.impressionServcie.calculatePctByAge(6, 17) >= c.value1);
        } else if ("PctYoungAdult" === c.type) {
          curr = (this.impressionServcie.calculatePctByAge(18, 24) >= c.value1);
        } else if ("PctAdult" === c.type) {
          curr = (this.impressionServcie.calculatePctByAge(25, 64) >= c.value1);
        } else if ("PctSenior" === c.type) {
          curr = (this.impressionServcie.calculatePctByAge(65, 110) >= c.value1);
        } else if ("PctMale" === c.type) {
          curr = (this.impressionServcie.calculatePctByGender(1) >= c.value1);
        } else if ("PctFemale" === c.type) {
          curr = (this.impressionServcie.calculatePctByGender(0) >= c.value1);
        }



        if (c.operator === 0) { // And
          last = (last && curr);
        } else if (c.operator === 1) { // Or
          last = (last || curr);
        } else if (c.operator === 2) { // And Not
          last = (last && !curr);
        } else if (c.operator === 3) { // Or Not
          last = (last || !curr);
        } else {
          last = curr;
        }


      }
    } else {
      console.log('No condition field. Probably an error');
    }

    return last;

  }


}
