import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef} from '@angular/core';
declare var YT: any;


@Component({
  selector: 'app-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.css']
})


export class YoutubeComponent implements OnInit {
  @Input() width: string;
  @Input() height: string;
  @Input() vidID: string;
  @Input() volume: string;
  @Output() onCompleted = new EventEmitter<string>();
  @Output() onReady = new EventEmitter<boolean>();
  timeout = 15;
  gloabalErrorTimer = setTimeout(()=> {this.onCompleted.emit('error');}, 15*1000);
  ytplayer;

  constructor() {
    this.height = '300';
    this.width = '500';

  }


  onPlayerReady(event) {

    const self = YT.get('ytplayer').b.b.self;
    self.onReady.emit(true);
    event.target.setVolume(self.volume*100);
    // event.target.playVideo();
  }

  onPlayerStateChange(event) {
    let timer;
    const self = YT.get('ytplayer').b.b.self;
    if(self.gloabalErrorTimer) {
      clearTimeout(self.gloabalErrorTimer);
    }
    switch (event.data) {
      case -1: // unstarted
        // console.log('unstarted');
        timer = setTimeout(()=> {self.onCompleted.emit('error');}, self.timeout*1000);
        break;
      case 0: // ended
        // console.log('ended');
        self.onCompleted.emit('success');
        break;
      case 1: // playing
        // console.log('playing');
        clearTimeout(timer);
        break;
      case 2: // paused
        // console.log('paused');
        timer = setTimeout(()=> {self.onCompleted.emit('error');}, self.timeout*1000);
        break;
      case 3: // buffering
        // console.log('buffering');
        timer = setTimeout(()=> {self.onCompleted.emit('error');}, self.timeout*1000);
        break;
      case 5: // video cued
        // console.log('cued');
        timer = setTimeout(()=> {self.onCompleted.emit('error');}, self.timeout*1000);
        break;
    }
  }

  onPlayerError(errorCode) {
    // console.log('error', errorCode);
    this.onCompleted.emit('error');
  }

  ngOnInit() {
    // console.log('vid',this.vidID);
    this.ytplayer = new YT.Player('ytplayer', {
      me: this,
      height: this.height,
      width: this.width,
      playerVars: {
        'autoplay': 1, 'controls': 0, 'showinfo': 0, 'iv_load_policy': 3, 'rel': 0, 'suggestedQuality': 'large', 'loop': 1
      },
      videoId: this.vidID,
      events: {
        'onReady': this.onPlayerReady,
        'onStateChange': this.onPlayerStateChange,
        'onError': this.onPlayerError
      },
      self:this
    });
    // console.log('audio', this.volume);
    // this.ytplayer.setVolume(0);
  }

}

