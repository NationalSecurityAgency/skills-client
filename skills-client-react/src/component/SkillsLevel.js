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
import SkillsLevelService from './SkillsLevelService';

import { SkillsConfiguration, SkillsReporter } from '@skills/skills-client-js';

import React from 'react';
import PropTypes from 'prop-types';

const emptyArrayIfNull = value => value ? value : [];

let currentLevel = 0;

const SkillsLevel = ({projectId}) => {
    const [skillLevel, setSkillLevel] = React.useState(currentLevel);

    const update = (details) => {
        const completed = emptyArrayIfNull(details.completed);

        const level = completed.filter((message) => {
            return message.id === 'OVERALL';
        }).reduce((maxLevel, currentLevelUpdateObject) => {
            const levelUpdate = currentLevelUpdateObject.level;
            return maxLevel < levelUpdate ? levelUpdate : maxLevel;
        }, currentLevel);

        if(level > currentLevel) {
            setSkillLevel(level);
        }
    };

    React.useEffect(() => {
        SkillsReporter.addSuccessHandler(update);

        const getProjectId = () => {
            if (!projectId) {
                return SkillsConfiguration.getProjectId();
            }
            return projectId;
        };

        SkillsConfiguration.afterConfigure()
            .then(() => {
                SkillsLevelService.getSkillLevel(getProjectId())
                    .then((result) => {
                        setSkillLevel(result);
                        currentLevel = result;
                    });
            });
    },[projectId]);


    return (
      <div>
          <span className="skills-level-text-display">Level {Number(skillLevel)}</span>
      </div>
    );
};

SkillsLevel.propTypes = {
    projectId: PropTypes.string
};

export default SkillsLevel;
