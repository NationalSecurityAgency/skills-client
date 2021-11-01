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
import Highlight from 'react-highlight';
import PropTypes from 'prop-types';

const beautify = require('js-beautify').js;
const beautifyHtml = require('js-beautify').html;

const SampleCode = ({options, selectedTheme}) => {

    const sampleCode = () => {
        const tags = beautifyHtml(`
         <div id="myApp">
                <SkillsDisplay options="${JSON.stringify(options)}" theme={selectedThemeObj.theme} />
            </div>
`,{indent_size: 4, indent_level: 2, end_with_newline: false, "html.format.contentUnformatted": "", "html.format.unformatted": ""});

        const js =  beautify(`
import { SkillsDisplay } from '@skilltree/skills-client-react';
    const selectedThemeObj = ${JSON.stringify(selectedTheme)};
    const MyComponent = () => {
        return (
            placeholder
        )
    };`, {indent_size: 2, indent_level: 1, end_with_newline: false});

        const replacedText = js.replace('placeholder', tags);
        return replacedText;
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
    options: PropTypes.object.isRequired,
    selectedTheme: PropTypes.object.isRequired
};

export default React.memo(SampleCode);
