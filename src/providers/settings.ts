const settingsModel: any = {
  "general":{
    "include snapshot":true,
    "face detection":{
      "enabled":false,
      "rate":200
    }
  },
  "brightsign":{
    "network sync":true,
    "hardwareAcceleration":false,
    "serial":true,
    "serial-bs":{
      "port":"2",
      "baudRate":9600,
      "Ending Line":"\\n",
      "Data Bits": 8,
      "Stop Bits": 1,
      "Parity": "none",
      "Echo": true
    },
    "updateLauncher":true,
    "updateApp":true,
    "mouse on":true,
    "orientation":"auto",
    "wifi": {
      "accessPointFrequency": 0,
      "accessPointMode": false,
      "caCertificates": "",
      "clientIdentifier": "",
      "country": "",
      "domain": "",
      "eapTlsOptions": "",
      "essId": null,
      "identity": "",
      "inboundShaperRate": 0,
      "metric": -1,
      "mtu": -1,
      "obfuscatedPassphrase": true,
      "passphrase": "",
      "securityMode": "",
      "vlanIdList": []
    }
  },
  "linux":{
    "network sync":true,
    "serial":true,
    "serial-general":{
      "path":"",
      "baudRate":9600,
      "Ending Line":"\\n",
      "Data Bits": 8,
      "Stop Bits": 1,
      "Parity": "none",
      "Echo": true
    },
    "check": {
      "updateLauncher": true,
      "updateApp": true
    }
  },
  "chrome":{
    "network sync":true,
    "serial":true,
    "check": {
      "updateLauncher": true,
      "updateApp": true
    }
  },
  "embedded":{
    "network sync":true,
    "serial":true,
    "check": {
      "updateLauncher": true,
      "updateApp": true
    }
  }

};


export default settingsModel;

