import React from 'react';
import { SkillsDisplayJS } from '@skills/skills-client-js';
import PropTypes from 'prop-types';
import './SkillsDisplay.css';

const SkillDisplay = ({theme=null, version=0, userId=null, authenticator, serviceUrl, projectId, disableAutoScroll=false, autoScrollStrategy, isSummaryOnly}) => {
    const [clientDisplay, setClientDisplay] = React.useState({});

    React.useEffect(() => {
        setClientDisplay(new SkillsDisplayJS({
            options: {authenticator, serviceUrl, projectId, disableAutoScroll, autoScrollStrategy, isSummaryOnly},
            version: version,
            theme: theme,
            userId: userId,
        }));
        clientDisplay.attachTo(document.getElementById("clientSkillsDisplayContainer"));

        return () => {
            clientDisplay.destroy();
        }
    },[theme, version, userId, authenticator, serviceUrl, projectId, disableAutoScroll, autoScrollStrategy, isSummaryOnly]);

    return ( <div id="clientSkillsDisplayContainer" /> );
};

SkillDisplay.propTypes = {
    theme: PropTypes.object,
    version: PropTypes.number,
    userId: PropTypes.string,
    authenticator: PropTypes.string,
    serviceUrl: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    disableAutoScroll: PropTypes.bool,
    autoScrollStrategy: PropTypes.string,
    isSummaryOnly: PropTypes.bool,
};

export default SkillDisplay;
