import {testEslint, testTypescript, packageCode} from './buildUtils.mjs';

async function main() {
	const noPackage = process.argv.includes('--no-package');

	console.log('Testing eslint...');
	if (!(await testEslint())) return;

	console.log('Testing and compiling typescript...');
	if (!(await testTypescript())) return;

	if (!noPackage) {
		console.log('Packaging...');
		if (!(await packageCode())) return;
	}

	console.log('Code successfully built!');
}

main();
