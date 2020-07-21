import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA, Injectable } from '@angular/core';


import { Controller } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {ScheduleService} from "../providers/schedule-service";
import { TemplateComponent } from './template/template.component';
import { ClockComponent } from './components/clock/clock.component';
import { ImageComponent } from './components/image/image.component';
import { GadgetComponent } from './components/gadget/gadget.component';
import { SafePipe } from './pipes/safe.pipe';
import { TextComponent } from './components/text/text.component';
import { RichTextComponent } from './components/rich-text/rich-text.component';
import { SlideshowComponent } from './components/slideshow/slideshow.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { WebpageComponent } from './components/webpage/webpage.component';
import { MarqueeComponent } from './components/marquee/marquee.component';
import { ShapeComponent } from './components/shape/shape.component';
import {WebviewComponent} from "./components/gallery/webview/webview.component";
import { YoutubeComponent } from './components/gallery/youtube/youtube.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {CommandService} from "../providers/command-service";
import { QrCodeComponent } from './components/qr-code/qr-code.component';
import { HotspotComponent } from './components/hotspot/hotspot.component';
import {AffidavitService} from "../providers/affidavits-service";
import {HeartbeatService} from "../providers/heartbeat-service";
import {SmartScheduleService} from "../providers/smart-schedule-service";
import {TemplateService} from "../providers/template-service";
import {TimezoneTranslateService} from "../providers/timezone-translate-service";
import {PlatformResolverService} from "../providers/platform-resolver-service-public";
import 'hammerjs';
import 'hammer-timejs';
import { TvTunerComponent } from './components/tv-tuner/tv-tuner.component';
import { PageComponent } from './components/page/page.component';
import { MenuComponent } from './menu/menu.component';

import {FormBuilder, FormsModule} from "@angular/forms";
import { AlertComponent } from './alert/alert.component';


import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ConnectionsPageComponent } from './menu/connections-page/connections-page.component';
import { GeneralPageComponent } from './menu/general-page/general-page.component';
import {SettingsService} from "../providers/settings-service";
import {ImpressionService} from "../providers/impression-service";
import {FacePageComponent} from './menu/face-page/face-page.component';
import {FaceDetectionComponent} from "./components/face-detection/face-detection.component";
import { ErrorHandler } from '@angular/core';
import { Notifier } from '@airbrake/browser';

@Injectable()
export class AirbrakeErrorHandler implements ErrorHandler {
  airbrake: Notifier;

  constructor() {
    this.airbrake = new Notifier({
      projectId: 278089,
      projectKey: '7eddf1959ac0623d00a50602c5618e6d',
      environment: 'production'
    });
  }

  handleError(error: any): void {
    this.airbrake.notify(error);
  }
}

@NgModule({
  declarations: [
    Controller,
    TemplateComponent,
    ClockComponent,
    ImageComponent,
    GadgetComponent,
    SafePipe,
    TextComponent,
    RichTextComponent,
    SlideshowComponent,
    GalleryComponent,
    WebpageComponent,
    MarqueeComponent,
    ShapeComponent,
    WebviewComponent,
    YoutubeComponent,
    QrCodeComponent,
    HotspotComponent,
    TvTunerComponent,
    PageComponent,
    MenuComponent,
    AlertComponent,
    FacePageComponent,
    ConnectionsPageComponent,
    GeneralPageComponent,
    FaceDetectionComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    BrowserAnimationsModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [ScheduleService, CommandService, AffidavitService, HeartbeatService, SmartScheduleService,
    TemplateService, TimezoneTranslateService, PlatformResolverService, SettingsService, FormBuilder, ImpressionService, {provide: ErrorHandler, useClass: AirbrakeErrorHandler}],
  bootstrap: [Controller],
  schemas: [NO_ERRORS_SCHEMA],
  entryComponents: [
    TemplateComponent,
    ClockComponent,
    ImageComponent,
    GadgetComponent,
    TextComponent,
    RichTextComponent,
    SlideshowComponent,
    GalleryComponent,
    MarqueeComponent,
    WebpageComponent,
    ShapeComponent,
    QrCodeComponent,
    HotspotComponent,
    TvTunerComponent,
    PageComponent,
    AlertComponent,
    FaceDetectionComponent
  ]
})
export class AppModule { }


