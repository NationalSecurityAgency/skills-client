import React from 'react';
import Highlight from 'react-highlight';
import PropTypes from 'prop-types';

const beautify = require('js-beautify').js;

const SampleCode = ({isSummaryOnly, selectedTheme}) => {
    //this should utilize React.useMemo
    const sampleCode = () => {
        //no template strings in react...
        return beautify(`import { SkillsDisplay, SkillsLevel } from '@skills/skills-client-vue';

                export default {
                  components: {
                    SkillsDisplay,
                  },
                  data() {
                    return {isSummaryOnly ? '\ndisplayOptions: { isSummaryOnly: true, },' : ''}
                      selectedTheme: {JSON.stringify(selectedTheme)}
                    };
                  },
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
                        <!--              // keep <template> and <script> tags separate, as one requires html highlighting and other javascript-->
                        <Highlight className="javascript">
                            <code className="html m-0 p-0">
                                &lt;template&gt;
                                &lt;skills-level /&gt; &lt;!-- You can display the user's current Level using the SkillsLevel component --&gt;
                                &lt;skills-display :theme="selectedTheme"/&gt;
                                &lt;/template&gt;

                                &lt;script&gt;</code>
                        </Highlight>
                        <Highlight className="javascript">
                            <code className="javascript p-0 m-0">{sampleCode}
                                &lt;/script&gt;
                            </code>
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