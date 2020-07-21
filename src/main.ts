import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { AppConfig } from './environments/environment';
import 'gsap';
import 'hammerjs';
import 'hammer-timejs';

if (AppConfig.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    preserveWhitespaces: false
  }).then(() => {
    if ('serviceWorker' in navigator && AppConfig.production) {
      navigator.serviceWorker.register('/ngsw-worker.js');
    }
  })
  .catch(err => console.error(err));
