/*
 * Copyright 2025 SkillTree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fs = require('fs-extra')
const destDir = "./app/assets/js";
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}
const deps = Object.keys(require("./package.json").dependencies);
const ignore = ['node_modules', '.git', 'test', 'coverage', 'src'];
deps.forEach(dependency => {
  const depDir = `node_modules/${dependency}`;
  fs.readdirSync(depDir).forEach(file => {
    if (!ignore.includes(file)) {
      const depDestDir = `${destDir}/${dependency}`;
      if (!fs.existsSync(depDestDir)) {
        fs.mkdirSync(depDestDir, { recursive: true });
      }
      fs.copy(`${depDir}/${file}`, `${depDestDir}/${file}`, err => {
        console.log(`Copied[${depDir}/${file}] to [${depDestDir}/${file}]`);
      });
    } else {
      console.log(`IGNORE - ${file}`);
    }
  });
});
