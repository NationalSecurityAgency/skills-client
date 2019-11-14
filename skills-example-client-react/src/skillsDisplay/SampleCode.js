import React from 'react';
import Highlight from 'react-highlight';
import PropTypes from 'prop-types';

const beautify = require('js-beautify').js;

const SampleCode = ({isSummaryOnly, selectedTheme}) => {
    const sampleCode = () => {
        return beautify(`import { SkillsDisplay, SkillsLevel } from '@skills/skills-client-vue';

                const MyComponent = () => {
                    return (
                        <div id="myApp">
                            <SkillsDisplay isSummaryOnly="${isSummaryOnly}" theme="${selectedTheme}" />
                        </div>
                    )
                };`, {indent_size: 2, indent_level: 1, end_with_newline: false});
    };

    return (
        <div
            id="sample-code"
            className="row">
            <div className="col-12">
                <div className="mb-5 mt-5 card bg-light">
                    <h5 className=" card-header text-info">
                        <strong>Sample Code</strong>
                    </h5>
                    <div className="card-body py-0">
                        <Highlight className="javascript">
                            <code className="javascript p-0 m-0">{sampleCode}</code>
                        </Highlight>
                    </div>
                </div>
            </div>
        </div>
    );
};

SampleCode.propTypes = {
    isSummaryOnly: PropTypes.bool.isRequired,
    selectedTheme: PropTypes.string.isRequired
};

export default SampleCode;