
/**
 * @license
 * Copyright (c) 2018. Catalyst LLC. All right reserved.
 *
 * All information contained herein is, and remains the property
 * of Catalyst LLC and its suppliers, if any. The intellectual and
 * technical concepts contained herein are proprietary to Catalyst LLC
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Catalyst LLC.
 */
import { Injector, HostBinding, OnInit, HostListener, EventEmitter, OnDestroy, ElementRef, Directive } from '@angular/core';
import {IRevelControl} from "../interfaces/revelControl";
import {TemplateService} from "../../providers/template-service";

import { TweenMax} from 'gsap'
import {animationCallbackEvent} from "../models/AnimationCallbackEvent";
import AnimationCallbackRootObject = animationCallbackEvent.AnimationCallbackRootObject;
import {schedule} from "../models/Schedule";
import Option = schedule.Option;




@Directive()
export class BaseComponent implements OnInit, OnDestroy, IRevelControl {

  /**@hidden*/
  private _top: string;
  /**@hidden*/
  private _height: number;
  /**@hidden*/
  private _width: number;
  /**@hidden*/
  private _sequence: number;
  /**@hidden*/
  private _options: any[];
  /**@hidden*/
  public model;
  /**@hidden*/
  public autoStart = true;
  /**@hidden*/
  public templateService: TemplateService;
  /**@hidden*/
  public corsUrl = 'https://gentle-forest-40324.herokuapp.com/';
  isInitialized = false;
  isStarted = false;
  /**@hidden*/
  templateHeight = 1;
  /**@hidden*/
  templateWidth = 1;
  /**@hidden*/
  x;
  /**@hidden*/
  y;
  /**@hidden*/
  view:any;
  /**@hidden*/
  transparentSrc = `${window["Controller"].platform.getAssetsPath()}/assets/img/transparent.png`;


  // onMediaPlayed = new EventEmitter<any>();

  /**@hidden*/
  startX = 0;
  /**@hidden*/
  startY = 0;


  /**
   * Use Subscribe format. Event object example {onStart:null,onComplete:null}
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  public onAnimation = new EventEmitter<AnimationCallbackRootObject>();

  /**
   * Use Subscribe format.
   * Can be used for a drag functionality. Refer to main page for example.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  public onLocationChange = new EventEmitter<any>();
  /**
   * Use Subscribe format.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  public onClick = new EventEmitter<MouseEvent>();
  /**
   * Use Subscribe format. Will return https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent on callback.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  public onTap = new EventEmitter<any>();
  /**
   * @see https://angular.io/api/core/EventEmitter
   * Use Subscribe format.
   * @type EventEmitter<any>
   */
  public onSwipe = new EventEmitter<any>();
  /**
   * Use Subscribe format.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  public onPan = new EventEmitter<any>();
  /**
   * Use Subscribe format.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  public onRotate = new EventEmitter<any>();
  /**
   * Use Subscribe format.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  public onPinch = new EventEmitter<any>();
  /**
   * Use Subscribe format.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */
  public onPress = new EventEmitter<any>();
  /**
   * Use Subscribe format.
   * @see https://angular.io/api/core/EventEmitter
   * @type EventEmitter<any>
   */

  /**@hidden*/
  state = 'active';

  /**@hidden*/
  @HostBinding('style.width')
  _styleWidth = '0';

  /**@hidden*/
  @HostBinding('id')
  id = '';

  /**@hidden*/
  @HostBinding('style.height')
  _styleHeight = '0';

  /**@hidden*/
  @HostBinding('style.opacity')
  _styleOpacity = 1;

  /**@hidden*/
  @HostBinding('style.background-color')
  _styleBackground = '';

  /**@hidden*/
  @HostBinding('style.position')
  _stylePosition = 'absolute';

  /**@hidden*/
  @HostBinding('style.top')
  _styleTop = '0';

  /**@hidden*/
  @HostBinding('style.left')
  _styleLeft = '0';

  /**@hidden*/
  @HostBinding('style.visibility')
  _styleVisibility = 'visible';

  /**@hidden*/
  @HostBinding('style.display')
  _styleDisplay = 'block';

  /**@hidden*/
  @HostBinding('style.box-shadow')
  _styleBoxShadow = '';

  /**@hidden*/
  @HostBinding('style.border-radius')
  _styleBorderRadius = '';

  /**@hidden*/
  @HostListener('click', ['$event']) onClickEvent(event: MouseEvent) {
    this.onClick.emit(event);
  }

  /**@hidden*/
  @HostListener('tap', ['$event']) onTapEvent(event) {
    event.preventDefault();
    this.onTap.emit(event);
  }

  /**@hidden*/
  @HostListener('swipe', ['$event']) onSwipeEvent(event) {
    event.preventDefault();
    this.onSwipe.emit(event);
  }

  /**@hidden*/
  @HostListener('pan', ['$event']) onPanEvent(event) {
    event.preventDefault();
    this.onPan.emit(event);
  }

  /**@hidden*/
  @HostListener('panstart', ['$event']) public onPanStart(event) {
    event.preventDefault();
    this.startX = this.x;
    this.startY = this.y;
  }

  /**@hidden*/
  @HostListener('panmove', ['$event']) public onPanMove(event) {
    event.preventDefault();
    this.x = this.startX + event.deltaX;
    this.y = this.startY + event.deltaY;
    this.onLocationChange.emit({x: this.x, y: this.y});
  }

  /**@hidden*/
  @HostListener('rotate', ['$event']) onRotateEvent(event) {
    event.preventDefault();
    this.onRotate.emit(event);
  }

  /**@hidden*/
  @HostListener('pinch', ['$event']) onPinchEvent(event) {
    event.preventDefault();
    this.onPinch.emit(event);
  }

  /**@hidden*/
  @HostListener('press', ['$event']) onPressEvent(event) {
    event.preventDefault();
    this.onPress.emit(event);
  }

  /**@hidden*/
  constructor(injector: Injector, private element: ElementRef) {

    this.model = injector.get('model', {});
    let name = this.model.name;
    this.id = name;
    this.templateService = injector.get('templateService', null);
    name = name.split(' ').join('_');
    // @ts-ignore
    window[name] = this.getModule();
    this.templateHeight = injector.get('templateHeight', 1);
    this.templateWidth = injector.get('templateWidth', 1);
    this.view = injector.get('view', null);
    this._height = this.model.height;
    this._width = this.model.width;
    this._options = this.model.option;

    this._styleOpacity = this.getOption('Opacity', 1);
    this._styleTop = this.model.top+'px';
    this._styleLeft = this.model.left+'px';
    this._styleHeight = this.height+'px';
    this._styleWidth = this.width+'px';
    this._styleBackground = this.getOption('BackColor', 'transparent');
    if(this._styleBackground !== 'transparent') {
      this._styleBackground = '#'+this._styleBackground;
    }
    this.x = parseInt(this._styleTop, 10);
    this.y = parseInt(this._styleLeft, 10);
  }

  /**
   * Adds shadow to the module.
   * @param value is a string corresponding to the appropriate css string. Example: "5px 10px #888888;"
   * @see https://www.w3schools.com/cssref/css3_pr_box-shadow.asp
   */
  setShadow(value) {
    this._styleBoxShadow = value;
  }

  /**
   * Sets Radius of a modules corners. This will round the corners of the module.
   * @param value in px
   * @see https://www.w3schools.com/cssref/css3_pr_border-radius.asp
   */
  setBorderRadius(value) {
    this._styleBorderRadius = value + 'px';
  }

  /**@hidden*/
  toggleState() {
    this.state = this.state === 'active' ? 'inactive' : 'active';
  }


  /**
   * @param duration in seconds
   */
  scale(duration:number, scale:number) {
    const animation = TweenMax.to(this.element.nativeElement, duration, {scale:scale});
    this.addAnimationCallback(animation);
  }

  /**
   * @param duration in seconds
   */
  fadeIn(duration:number) {
    const animation = TweenMax.to(this.element.nativeElement, duration, {alpha:1});
    this.addAnimationCallback(animation);
  }

  /**
   * @param duration in seconds
   */
  fadeOut(duration:number) {
    const animation = TweenMax.to(this.element.nativeElement, duration, {alpha:0});
    this.addAnimationCallback(animation);
  }


  /**
   * @param duration in seconds
   * @param rotation in degrees
   *
   */
  rotate(duration:number, rotation:number) {
    const animation = TweenMax.to(this.element.nativeElement, duration, {rotation:rotation});
    this.addAnimationCallback(animation);
  }

  /**
   * @param duration in seconds
   */
  translate(duration:number, left:number, top:number) {
    const animation = TweenMax.to(this.element.nativeElement, duration, {left:left, top:top});
    this.addAnimationCallback(animation);
  }

  /**
   * check the main page for an example of this function - Section Creating A Custom Animation
   * @param animationObj a JSON object formatted for GSAP
   * @see https://greensock.com/docs/TweenMax
   */
  animate(duration:number, animationObj:any) {
    const animation = TweenMax.to(this.element.nativeElement, duration, animationObj);
    this.addAnimationCallback(animation);
  }

  /**@hidden*/
  addAnimationCallback(animation) {
    animation.eventCallback("onComplete", (pram)=> {
      this.onAnimation.emit({onStart:null,onComplete:pram} as AnimationCallbackRootObject);
    }, ["{self}"]);
    animation.eventCallback("onStart", (pram)=> {
      this.onAnimation.emit({onStart:pram,onComplete:null} as AnimationCallbackRootObject);
    }, ["{self}"]);
  }

  private getModule() {
    return this as IRevelControl;
  }
  /**@hidden*/
  set top(value: string) {
    this._top = value+'px';
  }

  /**@hidden*/
  ngOnInit() {

  }

  /**@hidden*/
  ngOnDestroy() {
   delete window[name];
  }

  getName() {
    return this.model.name;
  }

  /**@hidden*/
  get width(): number {

    return this._width;
  }

  /**@hidden*/
  get height(): number {

    return this._height;
  }

  /**@hidden*/
  get options(): any {
    return this._options;
  }

  setTop(top) {
    this._styleTop = parseInt(top, 10)+'px';
  }


  getOption(name: string, defaultValue: any = null) {
    for (const opt of this._options) {
      if (opt && opt.name.toUpperCase() === name.toUpperCase()) {
        return opt.value;
      }
    }
    return defaultValue;
  }


  getHeight() {
    return this._styleHeight;
  }

  getOptions(): Option[] {
    return this.model.option as Option[];
  }

  getPlaylist() {
    return this.model.playlist;
  }

  getTop() {
    return parseInt(this._styleTop, 10);
  }


  getLeft() {
    return parseInt(this._styleLeft, 10);
  }

  getType() {
    return this.model.type;
  }

  getWidth() {
    return this._styleWidth;
  }

  /**@hidden*/
  getZIndex() {
    return this._sequence;
  }


  isAutoStart() {
    return this.autoStart;
  }

  setAutoStart(flag: boolean) {
    this.autoStart = flag;
  }

  setLeft(offset: number) {
    this._styleLeft = offset+'px';
  }

  start() {
    if(this.autoStart || this.isInitialized) {
      this.isStarted = true;
    }
    this.isInitialized = true;

  }

  stop() {
    this.isStarted = false;
  }

  /**@hidden*/
  componentInitialized() {
    if(this.autoStart) {
      this.start();
    }
  }

  setVisiblity(state: string) {
    this._styleVisibility = state;
  }

  show() {
    this._styleDisplay = "block";
  }

  hide() {
    this._styleDisplay = "none";
  }
  /**@hidden*/
  removeStringSpaces(val) {
    return val.replace(/\s/g, '');
  }
}
