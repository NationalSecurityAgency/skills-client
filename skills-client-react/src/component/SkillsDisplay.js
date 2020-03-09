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
import React from 'react';
import { SkillsDisplayJS } from '@skills/skills-client-js';
import PropTypes from 'prop-types';
import './SkillsDisplay.css';

let clientDisplay = null;
const destroy = (cd) => {
    if(cd){
        cd.destroy();
    }
};

const SkillDisplay = ({theme=null, version=null, userId=null, options={}}) => {

    React.useEffect(() => {
        clientDisplay = new SkillsDisplayJS({
            options: options,
            theme: theme,
            version: version,
            userId: userId,
        });

        clientDisplay.attachTo(document.getElementById("clientSkillsDisplayContainer"));

        return () => {
            destroy(clientDisplay);
        }
    },[theme, version, userId, options]);

    return ( <div id="clientSkillsDisplayContainer" /> );
};

SkillDisplay.propTypes = {
    theme: PropTypes.object,
    version: PropTypes.string,
    userId: PropTypes.string,
    options: PropTypes.shape({
        serviceUrl: PropTypes.string,
        projectId: PropTypes.string,
        disableAutoScroll: PropTypes.bool,
        autoScrollStrategy: PropTypes.string,
        isSummaryOnly: PropTypes.bool,
        scrollTopOffset: PropTypes.number,
    }),
};

export default SkillDisplay;
