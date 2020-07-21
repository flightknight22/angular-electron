import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
declare let Pusher;
@Component({
  selector: 'app-connections-page',
  templateUrl: './connections-page.component.html',
  styleUrls: ['./connections-page.component.css']
})
export class ConnectionsPageComponent {

  completed = [];
  error = [];
  currentStatus = 'NA';
  data = [{name: 'RevelDigital API', 'url': 'https://api.reveldigital.com/status'},
    {name: 'RevelDigital Player Services', 'url': 'https://svc1.reveldigital.com/status'},
    {name: 'RevelDigital Cloud Storage', 'url': 'https://cdn.reveldigital.com/status.json'},
    {name: 'RevelDigital Gadget Server', 'url': 'https://shindig.reveldigital.com/status.json'}];

  constructor(private http: HttpClient) {
    try{
      this.currentStatus = Pusher.instances[0].connection.state;
    }catch (e) {

    }
    if(this.currentStatus!=="connected"){
      this.error.push('command service')
    }
    for(let val of this.data){
      this.http.get(val.url).subscribe((res)=>{
        this.completed.push(val.name);
      },()=>{
        this.error.push(val.name);
      });
    }


  }

  isSuccess(item) {
    return this.completed.indexOf(item.name) > -1;
  }

  isError(item) {
    return this.error.indexOf(item.name) > -1;
  }

}
