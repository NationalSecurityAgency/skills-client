# Skills Reporter Service

This service provides the end user the ability to record that a user gained experience in a skill

## Installation

```bash
npm install @skills/skills-client-reporter
```

## Using

The library is built using UMD (Universal Module Definition) so you can include it as a ```<script src="..."></script>``` tag, or if you are using a bundling system by a ```require``` or ```import``` statement.

### CommonJS

```javascript
const SkillsReporter = require('@skills/skills-client-reporter');
```

### ES6

```javascript
import SkillsReporter from '@skills/skills-client-reporter';
```

### Manual importing via a ```<script>``` tag

Assuming your javascript file is located in a vendor/skills folder

```html
<script type="text/javascript" src="vendor/skills/SkillsReporter.umd.min.js" />
```

You can access the reporter globally with the variable name **SkillsReporter**

___

Once you have imported the service by your desired method you must initialize the service with 
1. The URL to the user skills service
2. Your project Id
3. authenticator

```javascript
const serviceUrl = 'https://pathToTheUserSkillsServiceHub';
const projectId = 'MyProject';
const authenticator = 'https://authTokenUrl';
SkillsReporter.initialize(serviceUrl, projectId, authenticator)
```

Initialization only needs to happen once, so it may be wise to do it in the entry point of your application.

To record a user's skill points make use of the ```reportSkill``` endpoint.  For example, if you have defined a user skill
to be recorded when a user clicks a help button.

```javascript
onHelpButtonClick() {
  SkillsReporter.reportSkill('onHelpButtonClick');
}
```

Optionally you can pass in an error handler if something goes wrong and the skill was unable to be recorded

```javascript
onHelpButtonClick() {
  SkillsReporter.reportSkill('onHelpButtonClick')
     .then((response) => {
       console.log(response);
     });
}
```

## Building

From the root of the library...
```
npm install
npm run build
```
