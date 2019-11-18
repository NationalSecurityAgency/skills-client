import React from 'react';
import SkillsDisplayThemeFactory from './ThemeFactory.js';
import SampleCode from './SampleCode';
import { SkillsDisplay } from '@skills/skills-client-react';
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';


const urlSearchParams = new URLSearchParams(window.location.search);
const saveUrlParam = (name, value) => {
    urlSearchParams.append(name, value);
};

const getUrlParam = (name) => {
    return urlSearchParams.get(name);
};

const getThemes = () => {
    return Object.values(SkillsDisplayThemeFactory);
};

const findTheme = (name) => {
    return getThemes().find((item) => item.name === name);
};

const scrollToRef = (ref) => window.scrollTo(0, ref.current.offsetTop);

function usePrevious(value){
    const ref = React.useRef();
    React.useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const ShowSkill = () => {
    const [selectedTheme, saveSelectedTheme] = React.useState(() => {
        const urlTheme = getUrlParam("themeName");
        if(urlTheme) {
         return findTheme(urlTheme);
        }
        return getThemes()[0];
    });
    const [version, setVersion] = React.useState(0);
    const [isSummaryOnly, setIsSummaryOnly] = React.useState(() => {
        const urlSummaryOnly = getUrlParam('isSummaryOnly');
        if ( urlSummaryOnly ) {
            return JSON.parse(urlSummaryOnly)
        }
        return false;
    });

    const previousIsSummaryOnly = usePrevious(isSummaryOnly);
    const [showSampleCode, setShowSampleCode] = React.useState(false);

    const refreshPage = () => {
        setTimeout(() => {
            document.location.reload();
        });
    };

    const toggleIsSummary = () => {
        setIsSummaryOnly(!previousIsSummaryOnly);
    };

    const setIsThemeUrlParam = (theme) => {
        saveUrlParam('themeName', theme.name);
        saveUrlParam('isSummaryOnly', isSummaryOnly);
        refreshPage();
    };

    const sampleCodeRef = React.createRef();
    const executeScroll = () => scrollToRef(sampleCodeRef);

    return (
        <div className="container">
            <div className="d-flex align-items-center">
                <DropdownButton
                    id="dropdown-1"
                    className="mb-3"
                    title="Theme"
                    variant="Primary">

                    { getThemes().map ( (theme) => {
                        return <Dropdown.Item
                        onclick={() => setIsThemeUrlParam(theme)}
                        key={theme.name}
                        eventKey={theme.name} {... (selectedTheme.name === theme.name ? {disabled:true} : "")}>
                            {theme.name}
                        </Dropdown.Item>
                    })}

                </DropdownButton>
                <Button variant={isSummaryOnly ? 'primary' : 'outline-primary'} onClick={toggleIsSummary}>Summary Only</Button>
                <Button variant="link" href="javascript:void" onClick={executeScroll}>Show Source</Button>
            </div>

            <div className="border rounded">
                <SkillsDisplay isSummaryOnly={isSummaryOnly} theme={selectedTheme}/>
            </div>

            <SampleCode ref={sampleCodeRef} isSummaryOnly={isSummaryOnly} selectedTheme={selectedTheme.name}/>
        </div>
    );
};

export default ShowSkill;