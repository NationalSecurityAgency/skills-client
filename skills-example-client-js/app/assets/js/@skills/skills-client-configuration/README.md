# User Skills Reporter Service

This service provides the end user the ability to record that a user gained experience in a skill

## Installation

```bash
npm install @skills/skills-client-configuration
```

## Using

The library is built using UMD (Universal Module Definition) so you can include it as a ```<script src="..."></script>``` tag, or if you are using a bundling system by a ```require``` or ```import``` statement.

### CommonJS

```javascript
const SkillsConfiguration = require('@skills/skills-client-configuration');
```

### ES6

```javascript
import SkillsConfiguration from '@skills/skills-client-configuration';
```

### Manual importing via a ```<script>``` tag

Assuming your javascript file is located in a vendor/UserSkills folder

```html
<script type="text/javascript" src="vendor/skills/SkillsConfiguration.umd.min.js" />
```

You can access the reporter globally with the variable name **SkillsConfiguration**

___

Once you have imported the service by your desired method you must initialize the service with 
1. The URL to the user skills service
2. Your project Id

```javascript
const serviceUrl = 'https://pathToTheUserSkillsServiceHub';
const projectId = 'MyProject';
UserSkillsReporter.initialize(serviceUrl, projectId);
```

Initialization only needs to happen once, so it may be wise to do it in the entry point of your application.

## Building

From the root of the library...
```
npm install
npm run build
```
