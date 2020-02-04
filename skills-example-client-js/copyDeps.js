const fs = require('fs-extra')
const destDir = "./app/assets/js";
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}
const deps = Object.keys(require("./package.json").dependencies);
const ignore = ['node_modules', '.git', 'test', 'coverage', 'src'];
deps.forEach(dependency => {
  const depDir = `node_modules/${dependency}`;
  fs.readdirSync(depDir).forEach(file => {
    if (!ignore.includes(file)) {
      const depDestDir = `${destDir}/${dependency}`;
      if (!fs.existsSync(depDestDir)) {
        fs.mkdirSync(depDestDir, { recursive: true });
      }
      fs.copy(`${depDir}/${file}`, `${depDestDir}/${file}`, err => {
        console.log(`Copied[${depDir}/${file}] to [${depDestDir}/${file}]`);
      });
    } else {
      console.log(`IGNORE - ${file}`);
    }
  });
});
