/*
 * Copyright 2020 SkillTree
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
var semver = require('semver');

export default {
    versionLaterThan (lib, minVersion){
        const versionToCompare = Cypress.env(lib);
        return this.laterThanMinVersion(minVersion, versionToCompare);
    },
    skillsClientJSVersionLaterThan(minVersion) {
        const versionToCompare = Cypress.env('skills-client-js-version')
        return this.laterThanMinVersion(minVersion, versionToCompare);
    },
    skillsServiceVersionLaterThan(minVersion) {
        const versionToCompare = Cypress.env('skills-service.minVersion');
        return this.laterThanMinVersion(minVersion, versionToCompare);
    },
    laterThanMinVersion(minVersion, currentVersion) {
        if (!currentVersion) {
            return true;
        }
        const shouldSkip = semver.lt(currentVersion, minVersion);
        return !shouldSkip;
    },
    laterThan_3_1_0() {
        return this.skillsServiceVersionLaterThan('3.1.0');
    },
    laterThan_1_4_0() {
        return this.skillsServiceVersionLaterThan('1.4.0');
    },
    laterThan_1_11_1() {
       return  this.skillsServiceVersionLaterThan('1.11.1');
    },
    noThemeBackground() {
        if (this.laterThan_3_1_0()) {
            return 'rgb(255, 255, 255)'
        }
        return this.laterThan_1_4_0() ? 'rgba(0, 0, 0, 0)' : 'rgb(255, 255, 255)';
    },
    rankDetailsTitle() {
        return this.laterThan_1_11_1() ? 'My Rank' : 'Rank Overview'
    },
}
