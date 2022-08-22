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
import { SkillsReporter } from '@skilltree/skills-client-react';
import axios from 'axios';

const beautify = require('js-beautify').js;
let selectedSkillId = '';

const ReportSkill = () => {
    const reportSkill = (skillId, resultContainer) => {
        SkillsReporter.reportSkill(skillId)
            .then((response) => {
                document.querySelector(resultContainer).innerHTML = JSON.stringify(response, null, 2);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const sampleCode = () => {
        return beautify(`SkillsReporter.reportSkill(this.skill)
              .then((res) => {
                    this.reportResult = res;
                });`, {indent_size: 2, indent_level: 1, end_with_newline: false})
    };

    const handleInputChange = (inputValue) => {
        selectedSkillId = inputValue.target.value;
    };

    const [selectData, setSelectData] = React.useState([]);

    React.useEffect(()=>{
        axios.get("/api/skills")
            .then((result) => {
                setSelectData(result.data);
                if (result.data && result.data.length > 0) {
                    selectedSkillId = result.data[0];
                }
            });
        SkillsReporter.addSuccessHandler((result) => {
            document.querySelector('#global-event-result-container').innerHTML = JSON.stringify(result, null, 2);
        });
    }, []);

    const style = {
        paddingTop: '55px'
    };

    return (
        <div className="container-fluid" style={style}>
            <div className="container">
                <h2>Report Skills Examples</h2>
                <div className="text-primary">Global Event Result:</div>
                <div id="globalEventResultDiv" className="border rounded p-3 mb-5 bg-light">
                    <pre id="global-event-result-container" data-cy="globalEventResult"></pre>
                </div>
                <div>
                    <h5 className="text-info"><strong>Report Any Skill</strong></h5>
                    <div className="card card-body bg-light">
                    <pre className="m-0 sample-code">
                    <code className="javascript">{sampleCode()}</code></pre>

                </div>
                <div className="card card-body mt-3">
                    <div id="exampleDirectiveClickEvent">
                        <div className="float-left mr-3">
                            <select onChange={(event) => handleInputChange(event)} className="custom-select custom-select-m mb-3">
                                {selectData.map((skill)=>{
                                    return <option key={skill} value={skill}>{skill}</option>
                                })}
                            </select>
                        </div>
                        <div className="float-left">
                            <button
                                    className="btn btn-outline-primary"
                                    onClick={() => reportSkill(selectedSkillId, '#report-result-container')}>
                                Report Skill
                            </button>
                        </div>
                    </div>
                    <hr />
                    <div className="text-primary">Result:</div>
                    <div className="border rounded p-3 bg-light">
                        <pre id="report-result-container"></pre>
                    </div>
                </div>
            </div>


            <div className="mt-5"></div>

        </div>
</div>
    )
};

export default ReportSkill;
