import {ESLint} from 'eslint';

import {exec as cliExec} from 'child_process';

import {exec as pkgExec} from 'pkg';

export async function testEslint() {
	try {
		const eslint = new ESLint();
		const results = await eslint.lintFiles(['src/**/*.ts']);
		const formatter = await eslint.loadFormatter('stylish');
		const resultText = formatter.format(results);
		if (resultText) console.log(resultText);
		return resultText === '';
	} catch (err) {
		console.error(err);
		return false;
	}
}

export function testTypescript() {
	return new Promise((resolve) => {
		try {
			cliExec('yarn --silent tsc', (err, stdout) => {
				if (stdout) console.log(stdout);
				resolve(!stdout.includes('error'));
			});
		} catch (err) {
			console.error(err);
			resolve(false);
		}
	});
}

export async function packageCode() {
	try {
		await pkgExec(['dist/tsc/index.js', '--target', 'node16-win-x64', '--output', 'dist/repeatBot.exe']);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}
