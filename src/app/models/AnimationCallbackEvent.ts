export namespace animationCallbackEvent {

  import TweenMax = gsap.TweenMax;

  export interface AnimationCallbackRootObject {
    onStart?: TweenMax;
    onComplete?: TweenMax;
  }

}

