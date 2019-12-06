import SkillsLevelService from './SkillsLevelService';

import SkillsConfiguration from '@skills/skills-client-configuration';
import { SkillsReporter } from '@skills/skills-client-reporter';

import React from 'react';
import PropTypes from 'prop-types';

const emptyArrayIfNull = value => value ? value : [];

let currentLevel = 0;

const SkillsLevel = ({projectId}) => {
    const [skillLevel, setSkillLevel] = React.useState(currentLevel);

    const getProjectId = () => {
        if (!projectId) {
            return SkillsConfiguration.getProjectId();
        }
        return projectId;
    };

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

        SkillsConfiguration.afterConfigure()
            .then(() => {
                SkillsLevelService.getSkillLevel(getProjectId())
                    .then((result) => {
                        setSkillLevel(result);
                        currentLevel = result;
                    });
            });
    },[]);


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
