<!---
Copyright 2020 SkillTree

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 -->
 
# SkillTree Client Lib - Native JS Lib

<p>
  <a href="https://www.npmjs.com/package/@skilltree/skills-client-js">
    <img src="https://flat.badgen.net/npm/dt/@skilltree/skills-client-js" alt="npm downloads">
  </a>
  <a href="https://www.npmjs.com/package/@skilltree/skills-client-js">
    <img src="https://flat.badgen.net/npm/dw/@skilltree/skills-client-js" alt="npm weekly downloads">
  </a>
  <a href="https://www.npmjs.com/package/@skilltree/skills-client-js">
    <img src="https://img.shields.io/npm/l/@skilltree/skills-client-js.svg?sanitize=true" alt="License">
  </a>
</p>

SkillTree is an innovative approach to implementing application training. SkillTree's ``skills-client-js`` project facilitates rapid integration with the SkillTree service. 

To learn about the SkillTree platform please visit our [Official Documentation](https://skilltreeplatform.dev/). 
These pages provide in-depth guidance on the installation, usage and contribution.  

## Library Features

SkillTree client library offers a comprehensive set of features:

- **Seamless navigation and visualization:** Our Skill Display component provides a fully navigable Ranking and Visualization view, making it easy for users to explore and understand their skills.
- **Effortless skill event reporting:** The SkillsReporter JS utility simplifies the process of reporting skill events, ensuring accurate and timely tracking of user progress.
- **Convenient level display:** Our level display component provides a straightforward way to showcase a user's current overall level within the application.
- **Global event handling:** Our JS functions enable applications to register to receive skill events, allowing for real-time notifications and updates. For example, you can use this feature to display encouraging messages when users earn points or complete levels, further enhancing their engagement and motivation.

## Important Note

To enable seamless integration with Skills Display, this library utilizes an iFrame wrapper to retrieve
the necessary views and data from the skills-service application. This deliberate architectural design choice is a key
aspect of the SkillTree Platform, as it minimizes the need for frequent upgrades to the skills-client library.

By decoupling the Skills Display functionality from the skills-client library, we've achieved a significant advantage:
most updates and improvements to Skills Display will be automatically reflected in the skills-client library whenever
the skills-service application is upgraded. This means that skills-client integrators can enjoy the benefits of new
features and enhancements without the need for manual library updates.

As a result, **the skills-client libraries are intentionally designed to be relatively static, with infrequent releases**.
This approach ensures that integrators can rely on a stable and consistent library, while still benefiting from the
ongoing evolution of the SkillTree Platform.

## Installation and Usage

To learn how to install and use this library please visit [SkillTree's Native JS Integration Guide](https://skilltreeplatform.dev/skills-client/js.html). 
