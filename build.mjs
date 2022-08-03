import {
  copyFileSync,
  readdirSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';

(async () => {
  // create new directory
  mkdirSync('./publish');

  // copy and paste the lib files to the new dir
  const sourcePath = './dist/libs/nest-mongo-migrate/src';
  const destPath = './publish';
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
    },
    null,
    2,
  );

  writeFileSync(join(destPath, 'package.json'), packageJSON);
  console.log('package ready to publish');
})();
