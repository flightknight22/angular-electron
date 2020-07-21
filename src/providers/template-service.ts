import {EventEmitter, Injectable} from '@angular/core';
import {PlatformResolverService} from "./platform-resolver-service-public";





@Injectable()

export class TemplateService {

  onTemplateInitialized = new EventEmitter<any>();
  onTemplateTerminated = new EventEmitter<any>();
  onTemplateStopped = new EventEmitter<any>();
  onTemplateStarted = new EventEmitter<any>();
  onTemplateResumed = new EventEmitter<any>();

  constructor(public platfrom:PlatformResolverService) {

  }

  stopTemplate() {
    this.onTemplateStopped.emit(true);
  }

  resumeTemplate() {
    this.onTemplateResumed.emit(true);
  }

  startTemplate() {
    this.onTemplateStarted.emit(true);
  }

  templateInitialized() {
    this.onTemplateInitialized.emit(true);
  }

  templateTerminated() {
    this.onTemplateTerminated.emit(true);
  }






}
