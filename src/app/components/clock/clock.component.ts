import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseComponent} from "../baseComponent";
import * as moment from 'moment-timezone';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import {Subscription} from "rxjs/Subscription";
import {TimezoneTranslateService} from "../../../providers/timezone-translate-service";


@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css']
})
export class ClockComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  /** @hidden*/
  @ViewChild('myCanvas',{static: true}) canvasRef: ElementRef;

  /** @hidden*/
  foreColor: string;
  /** @hidden*/
  backColor: string;
  /** @hidden*/
  format: string;
  /** @hidden*/
  text: string;
  /** @hidden*/
  fontFamily: string;
  /** @hidden*/
  currentTime;
  /** @hidden*/
  context;
  /** @hidden*/
  timer: Observable<any>;
  /** @hidden*/
  sub: Subscription;


  constructor(private injector: Injector, element: ElementRef, private timezoneTranslateService: TimezoneTranslateService) {
    super(injector, element);
    this.foreColor = this.getOption('ForeColor', 'FF0000');
    this.format = this.getOption('DateTimeFormat', 'd');
    this.fontFamily = this.getOption('FontFamily', 'Arial');
    this.timer = Observable.interval(30000);
    this.backColor = this.getOption('BackColor','rgba(255, 255, 255, 0.0)');
    if(this.backColor !== 'rgba(255, 255, 255, 0.0)') {
      this.backColor = '#'+this.backColor;
    }
  }
  /** @hidden*/
  refreshTime() {
      if(this.timezoneTranslateService.getTimezone()){
        moment.tz.setDefault(this.timezoneTranslateService.getTimezone());
      }
      if (this.format === 'd') {
        this.text = moment().format('M/D/YYYY');
      } else if (this.format === 'D') {
        this.text = moment().format('dddd, MMMM D, YYYY');
      } else if (this.format === 't') {
        this.text = moment().format('h:mm A');
      } else if (this.format === 'T') {
        this.text = moment().format('h:mm:ss A');
      } else if (this.format === 'f') {
        this.text = moment().format('dddd, MMMM D, YYYY  h:mm A');
      } else if (this.format === 'M') {
        this.text = moment().format('MMMM D');
      }


      if(this.currentTime!==this.text) {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.width, this.height);

        this.context.font = "20px '" + this.fontFamily + "'";
        const metrics = this.context.measureText(this.text);
        const textWidth = metrics.width;

        const scalex = (this.width / textWidth);
        const scaley = (this.height / 23);

        const ypos = (this.height / (scaley * 1.25));
        this.context.scale(scalex, scaley);
        if(this.backColor.length>1) {
          this.context.fillStyle = this.backColor;
        } else {
          this.context.fillStyle = 'rgba(255, 255, 255, 0.0)';
        }
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.fillStyle = "#"+this.foreColor;
        this.context.fillText(this.text, 0, ypos);
        this.currentTime = this.text;
      }


  }


  /** @hidden*/
  ngOnInit() {

    this.sub = this.timer.subscribe(
      () => {
        this.refreshTime();
      }
    );
  }
  /** @hidden*/
  ngAfterViewInit() {
    this.context = this.canvasRef.nativeElement.getContext('2d');

    this.refreshTime();
  }

  /** @hidden*/
    ngOnDestroy() {
      this.sub.unsubscribe();
    }
}
