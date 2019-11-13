import React from 'react';
import {SkillsDisplayJS} from '@skills/skills-client-js';
import PropTypes from 'prop-types';
import './SkillsDisplay.css';
import SkillsDisplayThemeFactory from './ThemeFactory.js';

const beautify = require('js-beautify').js;

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

const ShowSkill = () => {

 /*
 token: '',
            version: 0,
            displayOptions: {
                autoScrollStrategy: 'top-of-page',
                isSummaryOnly: this.$route.query.isSummaryOnly ? JSON.parse(this.$route.query.isSummaryOnly) : false,
            },
            showSampleCode: false,
            themes: this.getThemes(),
            selectedTheme: this.$route.query.themeName ? this.findTheme(this.$route.query.themeName) : this.getThemes()[0],
  */
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
    const [showSampleCode, setShowSampleCode] = React.useState(false);

    const refreshPage = () => {
        setTimeout(() => {
            document.location.reload();
        });
    };


    //this should utilize React.useMemo
    const sampleCode = () => {
        return beautify(`import { SkillsDisplay, SkillsLevel } from '@skills/skills-client-vue';

                export default {
                  components: {
                    SkillsDisplay,
                  },
                  data() {
                    return { ${isSummaryOnly ? '\ndisplayOptions: { isSummaryOnly: true, },' : ''}
                      selectedTheme: ${JSON.stringify(selectedTheme)}
                    };
                  },
                };`, {indent_size: 2, indent_level: 1, end_with_newline: false});
    };

    const setIsThemeUrlParam = (theme) => {
        saveUrlParam('themeName', theme.name);
        saveUrlParam('isSummaryOnly', isSummaryOnly);
        refreshPage();
    };

    return (
        <div class="container">
            <div class="d-flex align-items-center">
                <DropdownButton
                    id="dropdown-1"
                    class="mb-3"
                    title="Theme"
                    variant="Primary">

                    { getThemes().map ( (theme) => {

                        <Dropdown.Item
                        onclick={setIsThemeUrlParam(theme)}
                        eventKey="theme.name" {selectedTheme.name === theme.name ? "active" : ""}>
                            {theme.name}
                    </Dropdown.Item>
                    })
                    }
                </DropdownButton>
                <b-form-checkbox class="d-inline-block ml-3 border-right pr-2"
                             v-model="displayOptions.isSummaryOnly"
                             switch>
                    Summary Only
                </b-form-checkbox>

                <b-link
                    class="ml-2"
                    href="javascript:void"
                    v-scroll-to="'#sample-code'"
                @click="showSampleCode = true">Show Source
            </b-link>
        </div>
    )
}


<template>
    <div class="container">
        <div class="d-flex align-items-center">
            <b-dropdown
                id="dropdown-1"
                class="mb-3"
                text="Change Theme"
                variant="outline-primary">
                <b-dropdown-item
                    v-for="themeItem in themes"
                @click="setIsThemeUrlParam(themeItem)"
                :key="themeItem.name"
                :active="selectedTheme.name === themeItem.name">
                {{themeItem.name}}
            </b-dropdown-item>
        </b-dropdown>
        <b-form-checkbox class="d-inline-block ml-3 border-right pr-2"
                         v-model="displayOptions.isSummaryOnly"
                         switch>
            Summary Only
        </b-form-checkbox>

        <b-link
            class="ml-2"
            href="javascript:void"
            v-scroll-to="'#sample-code'"
        @click="showSampleCode = true">Show Source
        </b-link>
    </div>
<div class="border rounded">
    <skills-display
        v-if="selectedTheme"
    :options="displayOptions"
    :theme="selectedTheme.theme"/>
</div>
<div
    v-if="selectedTheme && showSampleCode"
    id="sample-code"
    class="row">
    <div class="col-12">
        <div class="mb-5 mt-5 card bg-light">
            <h5 class=" card-header text-info">
                <strong>Sample Code</strong>
            </h5>
            <div class="card-body py-0">
                <!--              // keep <template> and <script> tags separate, as one requires html highlighting and other javascript-->
                <pre v-highlightjs class="m-0 p-0">
                <code class="html m-0 p-0">
&lt;template&gt;
                    &lt;skills-level /&gt; &lt;!-- You can display the user's current Level using the SkillsLevel component --&gt;
                    &lt;skills-display :theme="selectedTheme" {{
                    this
                    .displayOptions.isSummaryOnly ? ':options="displayOptions"' : ''
                }}/&gt;
                    &lt;/template&gt;

                    &lt;script&gt;</code></pre>
                <pre v-highlightjs class="m-0 p-0">
                <code class="javascript p-0 m-0">{{sampleCode}}
                    &lt;/script&gt;
                </code>
            </pre>
            </div>
        </div>
    </div>
</div>
</div>
</template>

<
script >
import {SkillsDisplay} from '@skills/skills-client-vue';
import SkillsDisplayThemeFactory from './ThemeFactory.js';

import Vue from 'vue';
import VueScrollTo from 'vue-scrollto';

const beautify = require('js-beautify').js;

Vue.use(VueScrollTo, {
    container: "body",
    duration: 1000,
    easing: "ease",
    offset: 0,
    force: true,
    cancelable: true,
    onStart: false,
    onDone: false,
    onCancel: false,
    x: false,
    y: true,
});

export default {
    components: {
        SkillsDisplay,
    },
    data() {
        return {
            token: '',
            version: 0,
            displayOptions: {
                autoScrollStrategy: 'top-of-page',
                isSummaryOnly: this.$route.query.isSummaryOnly ? JSON.parse(this.$route.query.isSummaryOnly) : false,
            },
            showSampleCode: false,
            themes: this.getThemes(),
            selectedTheme: this.$route.query.themeName ? this.findTheme(this.$route.query.themeName) : this.getThemes()[0],
        };
    },
    computed: {
        sampleCode() {
            return beautify(`import { SkillsDisplay, SkillsLevel } from '@skills/skills-client-vue';

                export default {
                  components: {
                    SkillsDisplay,
                  },
                  data() {
                    return { ${this.displayOptions.isSummaryOnly ? '\ndisplayOptions: { isSummaryOnly: true, },' : ''}
                      selectedTheme: ${JSON.stringify(this.selectedTheme)}
                    };
                  },
                };`, {indent_size: 2, indent_level: 1, end_with_newline: false});
        },
    },
    watch: {
        'displayOptions.isSummaryOnly'() {
            this.setIsSummaryOnlyUrlParam();
        },
    },
    methods: {
        getThemes() {
            return Object.values(SkillsDisplayThemeFactory);
        },

        refreshPage() {
            setTimeout(() => {
                document.location.reload();
            }, 250);
        },

        setIsThemeUrlParam(theme) {
            this.$router.push({query: {themeName: theme.name, isSummaryOnly: this.displayOptions.isSummaryOnly}});
            this.refreshPage();
        },

        setIsSummaryOnlyUrlParam() {
            this.$router.push({
                query: {
                    themeName: this.selectedTheme.name,
                    isSummaryOnly: this.displayOptions.isSummaryOnly
                }
            });
            this.refreshPage();
        },

        findTheme(name) {
            return this.getThemes().find((item) => item.name === name);

        },
    },
}
</script>
