import * as fs from 'fs';
import * as path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const updateVersion = (filePath: string, newVersion: string) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const packageJson = JSON.parse(fileContent);

  packageJson.version = newVersion;

  if (filePath.includes('package-lock.json')) {
    packageJson.packages[''].version = newVersion;
  }

  fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
};

rl.question('Enter the new version: ', (newVersion) => {
  const rootPackageJsonPath = path.join(__dirname, '..', 'package.json');
  const releasePackageJsonPath = path.join(
    __dirname,
    '..',
    'release',
    'app',
    'package.json',
  );
  const releasePackageLockJsonPath = path.join(
    __dirname,
    '..',
    'release',
    'app',
    'package-lock.json',
  );

  updateVersion(rootPackageJsonPath, newVersion);
  updateVersion(releasePackageLockJsonPath, newVersion);
  updateVersion(releasePackageJsonPath, newVersion);

  // eslint-disable-next-line no-console
  console.log('Version updated successfully!');
  rl.close();
});
