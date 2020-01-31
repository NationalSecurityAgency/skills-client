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
