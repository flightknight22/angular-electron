const platforms: any = {
  web:{
    name:'pure_web',
    filesystem: null,
    packageLocation: 'https://uploads.cdn.reveldigital.com/',
    assetsLocation: '..',
    packageMediaLocation:'https://uploads.cdn.reveldigital.com/',
    rootFilePrefix:'https://uploads.cdn.reveldigital.com/',
    hasOwnScreenshot: false,
    revelDeviceName: 'Web',
    localStorageAvailable: true,
    caseSensitive: true,
    spaceSensitive: false
  },
  brightsign:{
    name:'brightsign',
    filesystem: null,
    packageLocation: 'file:///package/',
    assetsLocation: '../../app/dist',
    packageMediaLocation:'file:///package/Media/',
    rootFilePrefix:'file:///',
    hasOwnScreenshot: false,
    revelDeviceName: 'BrightSign',
    localStorageAvailable: true,
    caseSensitive: false,
    spaceSensitive: true
  },
  linux:{
    name:'linux',
    filesystem: null,
    packageLocation: './package/',
    assetsLocation: '.',
    packageMediaLocation:'./package/Media/',
    rootFilePrefix:'./',
    hasOwnScreenshot: true,
    revelDeviceName: 'GenericLinux',
    localStorageAvailable: true,
    caseSensitive: true,
    spaceSensitive: false
  },
  windows:{
    name:'windows',
    filesystem: null,
    packageLocation: './package/',
    assetsLocation: '.',
    packageMediaLocation:'./package/Media/',
    rootFilePrefix:'./',
    hasOwnScreenshot: true,
    revelDeviceName: 'GenericLinux',
    localStorageAvailable: true,
    caseSensitive: true,
    spaceSensitive: false
  },
  chrome:{
    name:'chrome',
    filesystem: null,
    packageLocation: '/package/',
    assetsLocation: '..',
    packageMediaLocation:'/package/Media/',
    rootFilePrefix:'/',
    hasOwnScreenshot: false,
    revelDeviceName: 'Web',
    localStorageAvailable: false,
    caseSensitive: true,
    spaceSensitive: false
  },
  embedded:{
    name:'embedded',
    filesystem: null,
    packageLocation: '/package/',
    assetsLocation: 'dist',
    packageMediaLocation:'/package/Media/',
    rootFilePrefix:'/',
    hasOwnScreenshot: false,
    revelDeviceName: 'Web',
    localStorageAvailable: false,
    caseSensitive: true,
    spaceSensitive: false
  },
  screensaver:{
    name:'pure_web',
    filesystem: null,
    packageLocation: 'https://uploads.cdn.reveldigital.com/',
    assetsLocation: '..',
    packageMediaLocation:'https://uploads.cdn.reveldigital.com/',
    rootFilePrefix:'https://uploads.cdn.reveldigital.com/',
    hasOwnScreenshot: false,
    revelDeviceName: 'Screensaver',
    localStorageAvailable: true,
    caseSensitive: true,
    spaceSensitive: false
  }
};

export default platforms;

