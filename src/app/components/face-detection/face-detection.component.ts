import {Component, ElementRef, Injector, OnInit} from '@angular/core';
import {BaseComponent} from "../baseComponent";
declare let faceapi;
declare let Controller;
@Component({
  selector: 'app-face-detection',
  templateUrl: './face-detection.component.html',
  styleUrls: ['./face-detection.component.css']
})
export class FaceDetectionComponent extends BaseComponent implements OnInit {
  faceArray = [];
  test;
  video;
  canvas;
  similarityThershold = .77;
  widthCalc;
  heightCalc;
  displaySize;
  faceBox = false;

  constructor(private injector: Injector, element: ElementRef, private el: ElementRef) {
    super(injector, element);
    this.widthCalc = parseInt(this._styleWidth.substring(0,this._styleWidth.length-2), 10);
    this.heightCalc = parseInt(this._styleHeight.substring(0,this._styleHeight.length-2), 10)
  }



  startVideo(rate) {
    navigator.getUserMedia(
      {video: {}},
      stream => this.video.srcObject = stream,
      err => console.error(err)
    );

    this.video.addEventListener('play', () => {
      this.canvas  = faceapi.createCanvasFromMedia(this.video);
      //document.body.append(this.canvas);

      this.el.nativeElement.append(this.canvas);
      this.canvas.style.position = 'absolute';
      //console.log(this.canvas)
      this.displaySize = {width: this.video.width, height: this.video.height}
      faceapi.matchDimensions(this.canvas, this.displaySize);

      setInterval( ()=> {
        this.getFaces().then((faces)=>{
          this.processFaceData(faces);
        })
      }, rate)

    });
  }


  async getFaces(){
    return new Promise(async (resolve)=>{
      resolve(await faceapi.detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender().withFaceDescriptors());
    })

  }

  processFaceData(detections){
    for (let face of detections) {
      let tmpArray:any = [];
      let closestDetection:any = {index: -1, value: 1};
      //console.log(face);
      for (const index in this.faceArray) {

        let faceSim = faceapi.euclideanDistance(face.descriptor, this.faceArray[index].face.descriptor);
        if (faceSim < this.similarityThershold && faceSim < closestDetection.value) {
          closestDetection.index = index;
          closestDetection.value = faceSim;
        }
      }
      if (closestDetection.index > -1) {
        this.faceArray[closestDetection.index].lastSeen = Date.now();
        face.age = this.faceArray[closestDetection.index].face.age;
        face.descriptor = this.faceArray[closestDetection.index].face.descriptor;
        this.faceArray[closestDetection.index].face = face;
        tmpArray.push(this.faceArray[closestDetection.index]);
      } else {
        console.log("new face");
        let tmpFace = {enter: Date.now(), lastSeen: Date.now(), face: face, id: Controller.getUniqueId()};
        this.faceArray.push(tmpFace);
        // tmpArray.push(tmpFace);
      }
      if(tmpArray.length>0) {
        Controller.sendCommand([{name: "faceImpression", arg: JSON.stringify(this.formatFaceArray(tmpArray))}], true)
      }
    }
    for (let index in this.faceArray) {
      if ((Date.now() - this.faceArray[index].lastSeen) / 1000 > 10) {
        console.log("face expired");
        this.faceArray.splice(Number(index), 1);
      }
    }



    const resizedDetections = faceapi.resizeResults(detections, this.displaySize);
    this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
    if(this.faceBox) {
      faceapi.draw.drawDetections(this.canvas, resizedDetections);
    } else {
      //console.log('d')
    }
      //faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);
      //faceapi.draw.drawFaceExpressions(this.canvas, resizedDetections);

  }

  showFaceBox(val){
    this.faceBox = val;
  }

  formatFaceArray(array){
    let tmpArray:any = [];
    for(let val of array){
      tmpArray.push({age:Math.round(val.face.age), blink:0, gender:val.face.gender, happiness:val.face.expressions.happy.toFixed(2), id:val.id, extra:val})
    }
    return tmpArray;
  }

  activateFaceAnalytics() {
    Promise.all([
      faceapi.nets.ageGenderNet.loadFromUri('./assets/models'),
      faceapi.nets.tinyFaceDetector.loadFromUri('./assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('./assets/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('./assets/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('./assets/models')
    ]).then(()=>{this.startVideo(100)})
  }




  /** @hidden*/
  ngOnInit() {
    this.video = document.getElementById('face-video');
    this.activateFaceAnalytics();
  }


}
