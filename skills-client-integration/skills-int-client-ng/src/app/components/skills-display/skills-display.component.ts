import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { themes } from './themes'
import { ViewportScroller } from '@angular/common';
import { js_beautify } from 'js-beautify'

@Component({
  selector: 'app-skills-display',
  templateUrl: './skills-display.component.html',
  styleUrls: ['./skills-display.component.css']
})
export class SkillsDisplayComponent implements OnInit {

  displayOptions: any;
  version: number;
  selectedTheme: any;
  themes: Array<any> = themes;
  showSampleCode: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private viewportScroller: ViewportScroller) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.version = params['skillsVersion'] ? JSON.parse(params['skillsVersion']) : 1000;
      this.displayOptions = {
        autoScrollStrategy: 'top-of-page',
        isSummaryOnly: params['isSummaryOnly'] ? JSON.parse(params['isSummaryOnly']) : false,
      };
      this.selectedTheme = params['themeName'] ? this.findTheme(params['themeName']) : this.themes[0];
    });
  }

  findTheme(name: string) {
    return this.themes.find((item) => item.name === name);
  }

  refreshPage() {
    setTimeout(() => {
      document.location.reload();
    }, 250);
  }

  setIsThemeUrlParam(theme) {
    this.router.navigate(['angular/showSkills'], { queryParams: { themeName: theme.name }, queryParamsHandling: 'merge' });
    this.refreshPage();
  }

  setIsSummaryOnlyUrlParam() {
    this.displayOptions.isSummaryOnly = !this.displayOptions.isSummaryOnly;
    this.router.navigate(['angular/showSkills'], { queryParams: { isSummaryOnly: this.displayOptions.isSummaryOnly }, queryParamsHandling: 'merge' });
    this.refreshPage();
  }

  scrollTo(elementId: string) {
    this.showSampleCode = true;
    setTimeout(() => {
      this.viewportScroller.scrollToAnchor(elementId);
    }, 250);
  }

  getSampleCode() {
    let sampleCode = `
<template>
   <skills-level /> <!-- You can display the user's current Level using the SkillsLevel component -->
   <skills-display :theme="selectedTheme" ${this.displayOptions.isSummaryOnly ? ':options="displayOptions"' : ''}/>
</template>

<script>
${js_beautify(`
import { SkillsDisplay, SkillsLevel } from '@skilltree/skills-client-vue';

export default {
  components: {
    SkillsDisplay,
  },
  data() {
    return {${this.displayOptions.isSummaryOnly ? '\ndisplayOptions: { isSummaryOnly: true, },' : ''}
      selectedTheme: ${JSON.stringify(this.selectedTheme, null, '  ')}
    };
  },
};
`)}
</script>
    `;
    return sampleCode;
  }
}
