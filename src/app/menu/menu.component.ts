import {Component, ElementRef, ViewChild} from '@angular/core';

declare let Controller;


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  version;
  currentSelection = "General";
  @ViewChild('dialog', {static: true}) dialog: ElementRef;
  constructor() {
    this.version = Controller.player.version;
  }
  close() {
    window['Controller'].toggleSettings();
  }

  showDialog() {
    this.dialog.nativeElement.showModal();
  }

  closeDialog() {
    this.dialog.nativeElement.close();
  }



}
