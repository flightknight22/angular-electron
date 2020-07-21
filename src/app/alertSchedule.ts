const alertSchedule: any = {
  "reveldigital": {
    "version": "3.1",
    "key": null,
    "utcoffset": "-5",
    "timezone": "Central Standard Time",
    "lastupdate": null,
    "device": {
      "id": 0,
      "opaqueid": null,
      "name": null,
      "groupname": null,
      "description": null,
      "devicetype": null,
      "devicecaps": 767,
      "key": null,
      "timezone": "Central Standard Time",
      "enteredservice": null,
      "lastservice": null,
      "lastupdate": null,
      "accounttype": null,
      "location": {
        "address1": null,
        "address2": null,
        "city": null,
        "county": null,
        "state": null,
        "postalcode": null,
        "country": null,
        "latitude": null,
        "longitude": null,
        "nwszoneid": null
      },
      "beacon": null
    },
    "schedule": [{
      "id": 0,
      "opaqueid": null,
      "type": "schedule",
      "name": "alert",
      "groupname": null,
      "starttime": "00:00",
      "endtime": "23:59",
      "startdate": "01/01/1970",
      "enddate": "01/01/2099",
      "days": 127,
      "description": null,
      "playlist": null,
      "template": {
        "id": 0,
        "opaqueid": null,
        "name": "alert",
        "groupname": "alert",
        "width": document.body.clientWidth,
        "height": document.body.clientHeight,
        "orientation": -1,
        "displaymode": 0,
        "script": null,
        "backcolor": "000000",
        "description": null,
        "module": [{
          "id": 0,
          "opaqueid": null,
          "name": "Alert",
          "type": "Alert",
          "left": 0,
          "top": 0,
          "width": document.body.clientWidth,
          "height": document.body.clientHeight,
          "sequence": 0,
          "playlist": null,
          "option": []

        }]
      },
      "commands": [],
      "conditions": [
        {
          "type": "BeforeTime",
          "sequence": 0,
          "value1": "05/14/2100 2:51:55 PM",
          "value2": "",
          "value3": "",
          "value4": "",
          "complement": false,
          "operator": 0
        },
        {
          "type": "BeforeDate",
          "sequence": 1,
          "value1": "05/14/2100 12:00:00 AM",
          "value2": "",
          "value3": "",
          "value4": "",
          "complement": false,
          "operator": 0
        }
      ],
    }],
    "deviceconfig": {
      "volume": null,
      "brightness": null,
      "reboottime": null,
      "poweroncmd": null,
      "poweroffcmd": null,
      "serviceurl": null,
      "displaycommands": [{
        "name": "poweron",
        "arg": null
      },
        {
          "name": "poweroff",
          "arg": null
        }
      ]
    },
    "vistarmedia": null
  }
};

export default alertSchedule;
