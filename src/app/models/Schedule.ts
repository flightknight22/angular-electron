export namespace schedule {

  export interface Location {
    address1?: string;
    address2?: any;
    city?: string;
    county?: string;
    state?: string;
    postalcode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    nwszoneid?: string;
  }

  export interface Device {
    id: number;
    opaqueid: string;
    name: string;
    groupname: string;
    description: string;
    devicetype: string;
    devicecaps: number;
    key: string;
    timezone: string;
    enteredservice: string;
    lastservice?: any;
    lastupdate?: any;
    accounttype: string;
    location: Location;
    beacon?: any;
  }

  export interface File {
    id: number;
    opaqueid: string;
    name: string;
    groupname: string;
    filename: string;
    filesize: number;
    mimetype: string;
    startdate?: any;
    enddate?: any;
    description: string;
  }

  export interface Condition {
    type: string;
    sequence: number;
    value1: string;
    value2: string;
    value3: string;
    value4: string;
    complement: boolean;
    operator: number;
  }

  export interface Option {
    name: string;
    value: string;
  }


  export interface Module {
    id: number;
    opaqueid: string;
    name: string;
    type: string;
    left: number;
    top: number;
    width: number;
    height: number;
    sequence: number;
    playlist: Playlist;
    option: Option[];
  }

  export interface Template {
    id: number;
    opaqueid: string;
    name: string;
    groupname: string;
    width: number;
    height: number;
    orientation: number;
    displaymode: number;
    script: string;
    backcolor: string;
    description: string;
    module: Module[];
  }


  export interface Source {
    id: number;
    opaqueid: string;
    name: string;
    type: string;
    value: string;
    fileid?: number;
    startdate?: any;
    enddate?: any;
    interval: number;
    file: File;
    flashvars?: any;
    conditions: Condition[];
  }


  export interface Playlist {
    id: number;
    opaqueid: string;
    name: string;
    groupname: string;
    type: string;
    interval?: any;
    description: string;
    source: Source[];
  }



  export interface Schedule {
    id: number;
    opaqueid: string;
    type: string;
    name: string;
    groupname: string;
    starttime: string;
    endtime: string;
    startdate: string;
    enddate: string;
    days: number;
    description: string;
    playlist?: Playlist;
    template?: Template;
    commands: any[];
    conditions: Condition[];
  }

  export interface Displaycommand {
    name: string;
    arg?: any;
  }

  export interface Deviceconfig {
    volume?: any;
    brightness?: any;
    reboottime?: any;
    poweroncmd?: any;
    poweroffcmd?: any;
    serviceurl?: any;
    displaycommands: Displaycommand[];
  }

  export interface Reveldigital {
    version: string;
    key: string;
    utcoffset: string;
    timezone: string;
    lastupdate?: any;
    device: Device;
    schedule: Schedule[];
    deviceconfig: Deviceconfig;
    vistarmedia?: any;
  }

  export interface ScheduleRootObject {
    reveldigital: Reveldigital;
  }

}

