/*
 * Copyright 2025 SkillTree
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
export default {
  removeAllChildren(domNode) {
    let child = domNode.lastElementChild;
    while (child) {
      domNode.removeChild(child);
      child = domNode.lastElementChild;
    }
    return domNode;
  },
  buildErrorPage() {
    const createElem = (tag, parent, text, style) => {
      const newElem = document.createElement(tag);
      if (parent) {
        parent.appendChild(newElem);
      }
      if (text) {
        newElem.appendChild(document.createTextNode(text));
      }
      if (style) {
        newElem.setAttribute('style', style);
      }
      return newElem;
    };

    const container = createElem('div', undefined, undefined, 'text-align: center; padding-top: 3rem; color: #3e3c3c;');
    const imageContainer = createElem('p', container);
    createElem('span', imageContainer, '😕', 'font-size: 6rem; border: 1px solid #ccc !important; border-radius: 4px; padding: 1rem 4rem 1rem 4rem;');
    createElem('p', container, 'Could NOT reach Skilltree Service.', 'font-size: 2rem; color: #460f0f;');
    createElem('div', container, 'Please contact the skilltree server administrator. ');
    return container;
  },
};
