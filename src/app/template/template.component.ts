import {
  Component, ComponentFactoryResolver, ElementRef, EventEmitter, HostBinding, Injector, Input, OnDestroy, OnInit,
  Output,
  ReflectiveInjector,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import {ITemplate} from "../interfaces/template";
import {ClockComponent} from "../components/clock/clock.component";
import {ImageComponent} from "../components/image/image.component";
import {GadgetComponent} from "../components/gadget/gadget.component";
import {TextComponent} from "../components/text/text.component";
import {RichTextComponent} from "../components/rich-text/rich-text.component";
import {SlideshowComponent} from "../components/slideshow/slideshow.component";
import {GalleryComponent} from "../components/gallery/gallery.component";
import {MarqueeComponent} from "../components/marquee/marquee.component";
import {WebpageComponent} from "../components/webpage/webpage.component";
import {ShapeComponent} from "../components/shape/shape.component";
import {QrCodeComponent} from "../components/qr-code/qr-code.component";
import {TemplateService} from "../../providers/template-service";
import {HeartbeatService} from '../../providers/heartbeat-service';
import {TvTunerComponent} from "../components/tv-tuner/tv-tuner.component";
import {PageComponent} from "../components/page/page.component";
import {AlertComponent} from "../alert/alert.component";
import {HotspotComponent} from "../components/hotspot/hotspot.component";
import {SettingsService} from "../../providers/settings-service";
import {ScheduleService} from "../../providers/schedule-service";
import {animationCallbackEvent} from "../models/AnimationCallbackEvent";
import AnimationCallbackRootObject = animationCallbackEvent.AnimationCallbackRootObject;
import {TweenMax} from "gsap";
import {FaceDetectionComponent} from "../components/face-detection/face-detection.component";


declare let ts;



/**@hidden*/
export enum Orientation {
  Landscape = 0,
  Landscape_Reversed = 180,
  Portrait = 90,
  Portrait_Reversed = 270,
}




@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})



export class TemplateComponent implements OnInit, OnDestroy, ITemplate {
  /** @hidden*/
  @Output() load = new EventEmitter<boolean>();
  /** @hidden*/
  @Output() componentsCreated = new EventEmitter<boolean>();
  /** @hidden*/
  @Input() injectedTemplate: any;
  /** @hidden*/
  @HostBinding('style.height')
  _styleHeight = '';
  @HostBinding('style.opacity')
  _styleOpacity = 1;
  @HostBinding('class')
  class = '';
  /** @hidden*/
  @HostBinding('style.width')
  _styleWidth = '';
  /** @hidden*/
  @HostBinding('style.background-color')
  _styleBackground = 'transparent';
  /** @hidden*/
  @HostBinding('style.overflow')
  _styleOverflow = 'hidden';

  /** @hidden*/
  @HostBinding('style.position')
  _stylePosition = 'absolute';

  /** @hidden*/
  model: any;
  /** @hidden*/
  modules = [];
  /** @hidden*/
  @ViewChild('container', {read: ViewContainerRef, static:true}) template: ViewContainerRef;
  /** @hidden*/
  @ViewChild('container', {static: true}) templateRef: ElementRef;

  public onAnimation = new EventEmitter<AnimationCallbackRootObject>();



  /** @hidden*/
  temlpateService: TemplateService;

  constructor(injector: Injector, private componentFactoryResolver: ComponentFactoryResolver,
              heartbeatService: HeartbeatService, private scheduleService:ScheduleService, private element: ElementRef,   private settingsService: SettingsService) {
    this.model = injector.get('model', '');

    this.temlpateService = injector.get('templateService', null);
    // if(injector.get('sclass', null)){
    //   this.class=injector.get('sclass', null);
    // }
    heartbeatService.addStatus(4);

    this.settingsService.syncSettings({orientation: this.getOrientation()}).then(
      result =>{
        if(result){
          window["Controller"].rebootSettingsModal();
        }

      }
    );


  }


  /** @hidden*/
  ngOnInit() {
    if(this.injectedTemplate){
      this.model = this.injectedTemplate;
    }



    this._styleWidth = this.getScaledWidth(this.model.displaymode, this.model.width) + 'px';
    this._styleHeight = this.getScaledHeight(this.model.displaymode, this.model.height) + 'px';

    this._styleBackground = '#'+ this.model.backcolor;

    for(let i = 0; i<this.model.module.length; i++) {
      this.createComponent(this.model.module[i]);
    }
    this.componentsCreated.emit(true);
    this.evalScript(this.model.script);
  }


  //fix for scaled displaymode property
  getScaledHeight(mode, height){
    if(mode===2 || mode==3){
      height = height*2;
    }
    return height;
  }

  //fix for scaled displaymode property
  getScaledWidth(mode, width){
    if(mode===1 || mode==3){
      width = width*2;
    }
    return width;
  }


  getHeight() {
    return this.model.height;
  }

  getDescription() {
    return this.model.description;
  }

  getModules() {
    return this.modules;
  }

  getName() {
    return this.model.name;
  }

  getOrientation() {
    return this.model.orientation;
  }

  getScript() {
    return this.model.script;
  }

  getWidth() {
    return this.model.width;
  }

  start() {
    this.load.emit(true);
    for(const module of this.modules) {
      module.start();
    }
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

  createPage(name:string,left:number,top:number,width:number,height:number,
             opacity:number,foreColor:string,backColor:string,sequence:number) {
    return this.createComponent({
      "name": name,
      "type": "Page",
      "left": left,
      "top": top,
      "width": width,
      "height": height,
      "sequence": sequence,
      "option": [
        {
          "name": "Opacity",
          "value": opacity
        },
        {
          "name": "ForeColor",
          "value": foreColor
        },
        {
          "name": "BackColor",
          "value": backColor
        },
      ],
    },).instance;
  }

  stop() {
    for(const module of this.modules) {
      module.stop();
    }
  }
  /** @hidden*/
  evalScript(script) {
    if(!this.scheduleService.previewMode) {
      const test = `try {${script}} catch (e){console.log()}`;

      const code = '({Run: (data: string): string => ' +
        '{' + test + 'return Promise.resolve("SUCCESS"); }})';
      // new Function(test)();
      // this.temlpateService.templateInitialized();
      // this.start();
      const result = ts.transpile(code);
      const runnable: any = eval(result);
       try {
        runnable.Run("RUN!").then((res) => {
          this.temlpateService.templateInitialized();
          this.start();
        }).catch((err) => {
          console.log('Script Error ', err);
          this.start();
        });
      } catch (e) {
        console.log(JSON.stringify(e));
      }
    }
    else {
      setTimeout(() => {
        this.start();
      }, 200)
    }
  }



  addToPage(page,comp) {
    const index = this.template.indexOf(comp.view);
    this.template.detach(index);
    page.addCompnent(comp);
  }



  private createComponent(model) {
    let type: any = null;
    switch (model.type) {
      case 'Clock':
        type = ClockComponent;
        break;
      case 'StaticImage':
        type = ImageComponent;
        break;
      case 'Gadget':
        type = GadgetComponent;
        break;
      case 'Text':
        type = TextComponent;
        break;
      case 'RichText':
        type = RichTextComponent;
        break;
      case 'Image':
        // const transitionType = this.getOption(model,'TransitionType');
        type = SlideshowComponent;
        break;
      case 'Gallery':
        type = GalleryComponent;
        break;
      case 'Web':
        type = WebpageComponent;
        break;
      case 'Ticker':
        type = MarqueeComponent;
        break;
      case 'Shape':
        type = ShapeComponent;
        break;
      case 'QRCode':
        type = QrCodeComponent;
        break;
      case 'HotSpot':
        type = HotspotComponent;
        break;
      case 'TV':
        if("Face Detection" === this.getOption(model,'TvType')){
          type = FaceDetectionComponent;
        } else {
          type = TvTunerComponent;
        }
        break;
      case 'Page':
        type = PageComponent;
        break;
      case 'Alert':
        type = AlertComponent;
        break;
      default:
        break;
    }



    if(type) {
      const inputProviders = [];
      inputProviders.push({
        provide: 'model',
        useValue: model
      });
      inputProviders.push({
        provide: 'templateService',
        useValue: this.temlpateService
      });

      inputProviders.push({
        provide: 'templateHeight',
        useValue: this.model.height
      });


      inputProviders.push({
        provide: 'templateWidth',
        useValue: this.model.width
      });




      // const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
      // const component = this.container.createComponent(componentFactory);

      const resolvedInputs = ReflectiveInjector.resolve(inputProviders);

      // We create an injector out of the data we want to pass down and this components injector
      const injector = ReflectiveInjector.fromResolvedProviders(resolvedInputs);

      // We create a factory out of the component we want to create
      const factory = this.componentFactoryResolver.resolveComponentFactory(type);

      // We create the component using the factory and the injector
      const component = factory.create(injector);
      // We insert the component into the dom container
      const obj = this.template.createComponent(factory, 0, injector);



      (<any>obj.instance).componentId = model.id;
      this.modules.push(obj.instance);
      (<any>obj.instance).view = obj.hostView;
      return obj;
    }
  }
  /** @hidden*/
  ngOnDestroy() {
    this.temlpateService.templateTerminated();
  }

  /** @hidden*/
  getOption(model, name: string, defaultValue: any = null) {
    // console.log(model);
    for (const opt of model.option) {
      if (opt && opt.name.toUpperCase() === name.toUpperCase()) {
        return opt.value;
      }
    }
    return defaultValue;
  }

  // todo getScript()
}
