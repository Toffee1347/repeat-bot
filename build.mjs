import {testEslint, testTypescript, compile, packageCode, changePackageIcon} from './buildUtils.mjs';

async function main() {
	const noPackage = process.argv.includes('--no-package');

	if (!noPackage) {
		console.log('Testing eslint...');
		if (!(await testEslint())) return;
	}

	console.log('Testing and compiling typescript...');
	if (!(await testTypescript())) return;

	console.log('Compiling...');
	if (!(await compile())) return;

	if (!noPackage) {
		console.log('Packaging...');
		if (!(await packageCode())) return;

		console.log('Changing package icon...');
		if (!(await changePackageIcon())) return;
	}

	console.log('Code successfully built!');
}

main();
