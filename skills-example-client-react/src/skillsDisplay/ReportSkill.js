import React from 'react';
import { SkillsReporter } from '@skills/skills-client-reporter';
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
    }, []);

    const style = {
        paddingTop: '55px'
    };

    return (
        <div className="container-fluid" style={style}>
            <div className="container">
                <h2>Report Skills Examples</h2>
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
