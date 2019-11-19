import React from 'react';
import Highlight from 'react-highlight';
import PropTypes from 'prop-types';

const beautify = require('js-beautify').js;
const beautifyHtml = require('js-beautify').html;

const SampleCode = ({isSummaryOnly, selectedTheme}) => {

    const sampleCode = () => {
        const tags = beautifyHtml(`
         <div id="myApp">
                <SkillsDisplay isSummaryOnly="${isSummaryOnly}" theme={selectedThemeObj.theme} />
            </div>
`,{indent_size: 4, indent_level: 2, end_with_newline: false, "html.format.contentUnformatted": "", "html.format.unformatted": ""});

        const js =  beautify(`
import { SkillsDisplay } from '@skills/skills-client-vue';
    const selectedThemeObj = ${JSON.stringify(selectedTheme)};
    const MyComponent = () => {
        return (
            placeholder
        )
    };`, {indent_size: 2, indent_level: 1, end_with_newline: false});
        return js.replace('placeholder', tags);
    };

    return (
    <div id="sample-code" className="row">
        <div className="col-12">
            <div className="mb-5 mt-5 card bg-light">
                <h5 className=" card-header text-info">
                    <strong>Sample Code</strong>
                </h5>
                <div className="card-body py-0">
                    <Highlight className="javascript">
                        <pre><code className="javascript p-0 m-0">{sampleCode()}</code></pre>
                    </Highlight>
                </div>
            </div>
        </div>
    </div>
    );
};

SampleCode.propTypes = {
    isSummaryOnly: PropTypes.bool.isRequired,
    selectedTheme: PropTypes.object.isRequired
};

export default SampleCode;