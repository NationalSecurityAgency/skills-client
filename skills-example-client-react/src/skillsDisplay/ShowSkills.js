import React from 'react';
import SkillsDisplayThemeFactory from './ThemeFactory.js';
import SampleCode from './SampleCode';
import { SkillsDisplay } from '@skills/skills-client-react';
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

    const previousIsSummaryOnly = usePrevious(isSummaryOnly);
    const previousSelectedTheme = usePrevious(selectedTheme);

    React.useEffect(() => {
        const saveUrlParam = (paramsObj) => {
            let params = '?';
            Object.keys(paramsObj).forEach((key) =>{
                params+=`${key}=${paramsObj[key]}&`;
            });
            params = params.replace(/&$/,'');
            history.push({pathname:history.location.pathname, search: params});
        };

        if (isSummaryOnly !== previousIsSummaryOnly || selectedTheme !== previousSelectedTheme) {
            saveUrlParam({'isSummaryOnly': isSummaryOnly, 'themeName': selectedTheme.name});
        }
    }, [isSummaryOnly, selectedTheme, previousIsSummaryOnly, previousSelectedTheme, history]);

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
                        onClick={() => saveSelectedTheme(theme)}
                        key={theme.name}
                        eventKey={theme.name} {... (selectedTheme.name === theme.name ? {disabled:true} : "")}>
                            {theme.name}
                        </Dropdown.Item>
                    })}

                </DropdownButton>
                <Button variant={isSummaryOnly ? 'primary' : 'outline-primary'} onClick={() => setIsSummaryOnly(!isSummaryOnly)}>Summary Only</Button>
                <Button variant="link" onClick={executeScroll}>Show Source</Button>
            </div>

            <div className="border rounded">
                <SkillsDisplay isSummaryOnly={isSummaryOnly} theme={selectedTheme.theme}/>
            </div>

            <div ref={sampleCodeRef}>
                <SampleCode isSummaryOnly={isSummaryOnly} selectedTheme={selectedTheme}/>
            </div>
        </div>
    );
};

export default ShowSkill;