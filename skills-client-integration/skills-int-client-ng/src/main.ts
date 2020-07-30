import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import axios from 'axios';
import { SkillsConfiguration } from '@skilltree/skills-client-ng'

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}
axios.get("/api/config")
  .then((result) => {
    SkillsConfiguration.configure(result.data);
  })
  .then(() => {
    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch(err => console.error(err));
  })
