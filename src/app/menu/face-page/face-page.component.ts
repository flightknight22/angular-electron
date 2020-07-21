import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SettingsService} from '../../../providers/settings-service';
import settingsModel from '../../../providers/settings';
/**@hidden*/
declare const showVideoWindow: any;
@Component({
  selector: 'app-face-page',
  templateUrl: './face-page.component.html',
  styleUrls: ['./face-page.component.css']
})
export class FacePageComponent implements OnInit {
  currentSettings:any = settingsModel;
  @ViewChild('intervalDialog', {static: true}) intervalDialog: ElementRef;
  @ViewChild('faceDialog', {static: true}) faceDialog: ElementRef;
  constructor(public settingService:SettingsService) {
    settingService.readSettings().then((settings)=> {
      this.currentSettings = settings;
    });

  }

  ngOnInit() {
    //setTimeout(()=>{showVideoWindow(true)}, 2000)
  }

  showIntervalDialog() {
    this.intervalDialog.nativeElement.showModal();
  }
  closeIntervalDialog() {
    this.intervalDialog.nativeElement.close();
  }

  showFaceDialog() {
    showVideoWindow(true);
    this.faceDialog.nativeElement.showModal();
  }
  closeFaceDialog() {
    showVideoWindow(false);
    this.faceDialog.nativeElement.close();
  }


  settingsChange(name, value) {
    try {

      if(value==null) {
        if (this.currentSettings.general['face detection'].hasOwnProperty(name)) {
          this.currentSettings.general['face detection'][name] = !this.currentSettings.general['face detection'][name];
        }
      }
      console.log(this.currentSettings)
      this.settingService.writeSettings(this.currentSettings);
      this.settingService.onSettingsChanged.emit(this.currentSettings);
    } catch (e) {
      console.log(e)
    }
  }
}
