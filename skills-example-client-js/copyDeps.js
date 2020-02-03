const fs = require('fs-extra')
const dir = "./app/assets/js";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
const deps = Object.keys(require("./package.json").dependencies);
deps.forEach(dependency => {
  fs.copy(`node_modules/${dependency}/`, `${dir}/${dependency}/`, err => {
    if (err) throw err;
    console.log(`Copied ${dependency} to ${dir}`);
  });
});