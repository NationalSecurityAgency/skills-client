import SkillsLevelService from '@/component/SkillsLevelService';

import SkillsConfiguration from '@skills/skills-client-configuration';
import { SkillsReporter } from '@skills/skills-client-reporter';

import React, from 'react';
import PropTypes from 'prop-types';

const emptyArrayIfNull = value => value ? value : [];

const SkillsLevel = ({projectId}) => {
    const [skillLevel, setSkillLevel] = React.useState();

    const getProjectId = () => {
        if (!projectId) {
            return SkillsConfiguration.getProjectId();
        }
        return projectId;
    };

    const update = (details) => {
        const completed = emptyArrayIfNull(details.completed);

        setSkillLevel(completed.filter((message) => {
            return message.id === 'OVERALL';
        }).reduce((maxLevel, currentLevelUpdateObject) => {
            const levelUpdate = currentLevelUpdateObject.level;
            return maxLevel < levelUpdate ? levelUpdate : maxLevel;
        }, skillLevel));
    };

    React.useState(() => {
        //there's no separate react equivalent to created
        SkillsReporter.addSuccessHandler(update);

        SkillsConfiguration.afterConfigure()
            .then(() => {
                SkillsLevelService.getSkillLevel(getProjectId())
                    .then((result) => {
                        setSkillLevel(result);
                    });
            });

    }, []);

    return (
        <SkillsLevel>
            {skillLevel && <span class="skills-level-text-display">skillLevel</span>}
        </SkillsLevel>
    );
};

SkillsLevel.propTypes = {
    projectId: PropTypes.string
};

export default SkillsLevel;