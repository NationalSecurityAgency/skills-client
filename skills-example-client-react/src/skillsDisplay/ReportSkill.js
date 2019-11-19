import React from 'react';
import { SkillsReporter } from '@skills/skills-client-reporter';
const beautify = require('js-beautify').js;

const ReportSkill = () => {
    const reportSkill = (skillId) => {
        SkillsReporter.reportSkill(skillId)
            .then((response) => {
                document.querySelector('#report-result-container').innerHTML = JSON.stringify(response, null, 2);
            });
    };

    const sampleCode = () => {
        return beautify(`SkillsReporter.reportSkill(this.skill)
              .then((res) => {
                    this.reportResult = res;
                });`, {indent_size: 2, indent_level: 1, end_with_newline: false})
    };

    return (
        <div className="container-fluid mt-3">
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
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => reportSkill('IronMan')}>
                            Report Skill
                        </button>
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