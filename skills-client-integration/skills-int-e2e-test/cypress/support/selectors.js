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

import Utils from "../e2e/Utils";

const buildFirstSubjectTileBtnSelector = () => {
    if (Utils.skillsServiceVersionLaterThan('3.0.0')) {
        return '[data-cy="subjectTile-subj0"] [data-cy="subjectTileBtn"]'
    }

    return '[data-cy="subjectTile"]:nth-child(1)'
}

const buildMyRankBtnSelector = () => {
    if (Utils.skillsServiceVersionLaterThan('3.0.0')) {
        return '[data-cy="myRankBtn"]'
    }

    return '[data-cy="myRank"]'
}


const buildSkillLinkSelector = (skillId) => {
    if (Utils.skillsServiceVersionLaterThan('3.0.0')) {
        return `[data-cy="skillProgressTitle-${skillId}"] [data-cy="skillProgressTitle"]`
    }

    return `#skillRow-${skillId} [data-cy="skillProgressTitle"]`
}

const buildSkillTitleSelector = (skillId) => {
    if (Utils.skillsServiceVersionLaterThan('3.0.0')) {
        return `[data-cy="skillProgressTitle-${skillId}"]`
    }

    return `#skillProgressTitle-${skillId}`
}

const buildBreadcrumbLinkSelector = (itemId) => {
    if (Utils.skillsServiceVersionLaterThan('3.0.0')) {
        return `[data-cy="breadcrumbLink-${itemId}"]`
    }
    return`[data-cy="breadcrumb-${itemId}"]`
}


const selectors = {
    backButton: '[data-cy=back]',
    myRankButton: buildMyRankBtnSelector(),
    titleSection: '[data-cy="skillsTitle"]',
    nextSkillButton: '[data-cy="nextSkill"]',
    firstSubjectTileBtn: buildFirstSubjectTileBtnSelector(),
    buildSkillLinkSelector: buildSkillLinkSelector,
    buildSkillTitleSelector: buildSkillTitleSelector,
    buildBreadcrumbLinkSelector: buildBreadcrumbLinkSelector
}
export default selectors