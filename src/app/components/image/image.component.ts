import {BaseComponent} from "../baseComponent";
import {Component, ElementRef, Injector, OnInit} from "@angular/core";
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent extends BaseComponent implements OnInit {
  /** @hidden*/
  url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAw' +
    'CAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // default blank src

  constructor(private injector: Injector, element: ElementRef, protected _sanitizer: DomSanitizer) {
    super(injector, element);
    this.url = this.templateService.platfrom.getPath()+encodeURIComponent(this.getOption('File',''));
  }
  /** @hidden*/
  setUrlSource(url) {
    this.url = url;
  }
  /** @hidden*/
  setLocalSource(fileId) {
    // this.url = url;
  }


  /** @hidden*/
  ngOnInit() {
  }

  /** @hidden*/
  timeout() {
    const tempSrc = this.url;
    this.url = this.transparentSrc;
    setTimeout(()=> {
      this.url = tempSrc;
    }, 30*1000);
  }
}
