import {Component, ElementRef, Injector, OnInit} from '@angular/core';
import {BaseComponent} from "../baseComponent";

@Component({
  selector: 'app-hotspot',
  templateUrl: './hotspot.component.html',
  styleUrls: ['./hotspot.component.css']
})
export class HotspotComponent extends BaseComponent implements OnInit {




  constructor(private injector: Injector, element: ElementRef) {
    super(injector, element);
  }
  /** @hidden*/
  ngOnInit() {
  }

}
