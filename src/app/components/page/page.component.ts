import {
  Component, ElementRef, HostBinding, HostListener, Injector, OnInit, ViewChild,
  ViewContainerRef
} from '@angular/core';
import {BaseComponent} from "../baseComponent";


@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent extends BaseComponent implements OnInit {
  /** @hidden*/
  foreColor: string;
  /** @hidden*/
  backColor: string;
  /** @hidden*/
  @ViewChild('container', {read: ViewContainerRef, static:true}) template: ViewContainerRef;
  /** @hidden*/
  pageComponents = [];
  /** @hidden*/
  atTop = true;
  /** @hidden*/
  atBottom = false;
  /** @hidden*/
  @HostBinding('style.z-index')
  _styleSequence = 0;
  /** @hidden*/
  @HostListener('scroll', ['$event']) onScroll(event) {
    if(event.target.scrollTop === 0) {
      this.atTop = true;
    } else {
      this.atTop = false;
    }
    if(event.target.scrollTop + event.target.offsetHeight === event.target.scrollHeight) {
      this.atBottom = true;
    } else {
      this.atBottom = false;
    }

  }


  constructor(private injector: Injector, element: ElementRef) {
    super(injector, element);
    this._styleSequence = this.model.sequence;
    this.foreColor = this.getOption('ForeColor', '');
    this.backColor = this.getOption('BackColor', '');

  }

  addCompnent(comp) {
    this.template.insert(comp.view);
    if(!this.isAutoStart()) {
      comp.setAutoStart(false);
    }
    this.pageComponents.push(comp);
  }


  start() {
    for(const val of this.pageComponents) {
      val.start();
    }
  }

  setAutoStart(flag) {
    for(const val of this.pageComponents) {
      val.setAutoStart(flag);
    }
  }

  stop() {
    for(const val of this.pageComponents) {
      val.stop();
    }
  }

  /** @hidden*/
  ngOnInit() {
  }
}
