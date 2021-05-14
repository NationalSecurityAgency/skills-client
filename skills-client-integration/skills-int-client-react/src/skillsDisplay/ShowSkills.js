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
import SkillsDisplayThemeFactory from './ThemeFactory.js';
import SampleCode from './SampleCode';
import { SkillsDisplay } from '@skilltree/skills-client-react';
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import { useHistory } from "react-router-dom";

const getThemes = () => {
    return Object.values(SkillsDisplayThemeFactory);
};

const findTheme = (name) => {
    return getThemes().find((item) => item.name === name);
};

const scrollToRef = (ref) => window.scrollTo(0, ref.current.offsetTop);

const handleRouteChanged = (newPath) => {
    document.querySelector('#skillsDisplayPath').innerHTML = `Skills Display Path: [${newPath}]`;
};

function usePrevious(value){
    const ref = React.useRef();
    React.useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const ShowSkill = () => {
    const history = useHistory();

    const getUrlParam = (name) => {
        const urlSearchParams = new URLSearchParams(history.location.search);
        return urlSearchParams.get(name);
    };

    const [selectedTheme, saveSelectedTheme] = React.useState(() => {
        const urlTheme = getUrlParam("themeName");
        if(urlTheme) {
         return findTheme(urlTheme);
        }
        return getThemes()[0];
    });

    const [isSummaryOnly, setIsSummaryOnly] = React.useState(() => {
        const urlSummaryOnly = getUrlParam('isSummaryOnly');
        if ( urlSummaryOnly ) {
            return JSON.parse(urlSummaryOnly)
        }
        return false;
    });

    const [internalBackButton, setInternalBackButton] = React.useState(() => {
        const urlInternalBackButton = getUrlParam('internalBackButton');
        if ( urlInternalBackButton ) {
            return JSON.parse(urlInternalBackButton)
        }
        return false;
    });

    const [skillsVersion] = React.useState(() => {
        const skillsVersion = getUrlParam("skillsVersion");
        if(skillsVersion) {
            return skillsVersion;
        }
        return '';
    });

    const [options, setOptions] = React.useState({ isSummaryOnly: isSummaryOnly, internalBackButton: internalBackButton, autoScrollStrategy: 'top-offset', scrollTopOffset: 110 });

    const previousIsSummaryOnly = usePrevious(isSummaryOnly);
    const previousInternalBackButton = usePrevious(internalBackButton);
    const previousSelectedTheme = usePrevious(selectedTheme);
    const previousSkillsVersion = usePrevious(skillsVersion);

    React.useEffect(() => {
        const saveUrlParam = (paramsObj) => {
            let params = '?';
            Object.keys(paramsObj).forEach((key) =>{
                params+=`${key}=${paramsObj[key]}&`;
            });
            params = params.replace(/&$/,'');
            history.replace({pathname:history.location.pathname, search: params});
        };

        if (isSummaryOnly !== previousIsSummaryOnly || internalBackButton !== previousInternalBackButton || selectedTheme !== previousSelectedTheme) {
            saveUrlParam({'isSummaryOnly': isSummaryOnly, 'internalBackButton': internalBackButton, 'themeName': selectedTheme.name, 'skillsVersion': skillsVersion});
        }

    }, [isSummaryOnly, internalBackButton, selectedTheme, skillsVersion, previousIsSummaryOnly, previousInternalBackButton, previousSelectedTheme, previousSkillsVersion, history]);

    const sampleCodeRef = React.createRef();
    const executeScroll = () => scrollToRef(sampleCodeRef);

    const style = {
        paddingTop: '55px'
    };

    return (
        <div className="container" style={style}>
            <div className="d-flex align-items-center">
                <DropdownButton
                    id="dropdown-1"
                    className="mb-3"
                    title="Theme"
                    variant="Primary">

                    { getThemes().map ( (theme) => {
                        return <Dropdown.Item
                        onClick={() => saveSelectedTheme(theme)}
                        key={theme.name}
                        eventKey={theme.name} {... (selectedTheme.name === theme.name ? {disabled:true} : "")}>
                            {theme.name}
                        </Dropdown.Item>
                    })}

                </DropdownButton>
                <Button variant={isSummaryOnly ? 'primary' : 'outline-primary'}
                        onClick={() => { setIsSummaryOnly(!isSummaryOnly);
                        setOptions({isSummaryOnly:!isSummaryOnly,internalBackButton:internalBackButton,autoScrollStrategy: 'top-offset', scrollTopOffset: 110}) }}>Summary Only</Button>

                <Button variant={internalBackButton ? 'primary' : 'outline-primary'}
                        onClick={() => { setInternalBackButton(!internalBackButton);
                            setOptions({isSummaryOnly:isSummaryOnly,internalBackButton:!internalBackButton,autoScrollStrategy: 'top-offset', scrollTopOffset: 110}) }}>Internal Back Button</Button>
                <Button variant="link" onClick={executeScroll}>Show Source</Button>
            </div>
            <div>
                <span id="skillsDisplayPath" data-cy="skillsDisplayPath"></span>
            </div>
            <div className="border rounded">
                <SkillsDisplay options={options} theme={selectedTheme.theme} version={skillsVersion} handleRouteChanged={handleRouteChanged}/>
            </div>

            <div ref={sampleCodeRef}>
                <SampleCode options={options} selectedTheme={selectedTheme}/>
            </div>
        </div>
    );
};

export default ShowSkill;
