import {
  copyFileSync,
  readdirSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join, resolve } from 'path';
import rimraf from 'rimraf';

(async () => {
  const destPath = resolve('../publish');
  const sourcePath = './dist/libs/nest-mongo-migrate/src';

  // delete folder
  rimraf.sync(destPath);
  // copy and paste the lib files to the new dir

  // create new directory
  mkdirSync(destPath);

  const files = readdirSync(sourcePath);
  files.forEach((file) => {
    copyFileSync(join(sourcePath, file), join(destPath, file));
  });

  // create package.json
  const {
    name,
    version,
    description,
    author,
    license,
    repository,
    keywords,
    bugs,
    homepage,
    dependencies,
    peerDependencies,
  } = JSON.parse(readFileSync('./package.json', 'utf-8'));

  const packageJSON = JSON.stringify(
    {
      name,
      version,
      description,
      author,
      license,
      main: 'index.js',
      repository,
      keywords,
      bugs,
      homepage,
      dependencies,
      peerDependencies,
      devDependencies: peerDependencies,
    },
    null,
    2,
  );

  writeFileSync(join(destPath, 'package.json'), packageJSON);
  console.log('package ready to publish');
})();
