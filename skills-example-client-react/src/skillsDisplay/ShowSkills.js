import React from 'react';
import './SkillsDisplay.css';
import SkillsDisplayThemeFactory from './ThemeFactory.js';
import SampleCode from './SampleCode';
import SkillsDisplay from '@skills/skills-client-react';
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from 'react-bootstrap/Dropdown';


const urlSearchParams = new URLSearchParams(location.search);
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
        <div class="container">
            <div class="d-flex align-items-center">
                <DropdownButton
                    id="dropdown-1"
                    class="mb-3"
                    title="Theme"
                    variant="Primary">

                    { getThemes().map ( (theme) => {
                        return <Dropdown.Item
                        onclick={() => setIsThemeUrlParam(theme)}
                        eventKey="theme.name" {selectedTheme.name === theme.name ? "active" : ""}>
                            {theme.name}
                        </Dropdown.Item>
                    })}

                </DropdownButton>
                <Button variant={isSummaryOnly ? 'primary' : 'outline-primary'} onclick={toggleIsSummary}>Summary Only</Button>
                <Button variant="link" href="javascript:void" onclick={executeScroll}>Show Source</Button>
            </div>

            <div class="border rounded">
                <SkillsDisplay isSummaryOnly={isSummaryOnly} theme={selectedTheme.name}/>
            </div>

            <SampleCode ref={sampleCodeRef} isSummaryOnly={isSummaryOnly} selectedTheme={selectedTheme.name}/>
        </div>
    );
};

export default ShowSkill;