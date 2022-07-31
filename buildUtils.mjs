import {ESLint} from 'eslint';

import {exec as cliExec} from 'child_process';

import path from 'path';
import {fileURLToPath} from 'url';
import {build} from 'esbuild';

import {exec as pkgExec} from 'pkg';

import resourceHacker from '@lorki97/node-resourcehacker';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function compile() {
	try {
		const buildRes = await build({
			bundle: true,
			format: 'cjs',
			target: 'es2020',
			platform: 'node',
			entryPoints: [path.join(__dirname, 'dist', 'tsc', 'index.js')],
			outdir: path.join(__dirname, 'dist', 'esbuild'),
		});
		if (buildRes.errors.length !== 0) console.error(buildRes.errors);
		return buildRes.errors.length === 0;
	} catch (err) {
		console.error(err);
		return false;
	}
}

export async function packageCode() {
	try {
		await pkgExec(['dist/esbuild/index.js', '--target', 'node16-win-x64', '--output', 'dist/repeatBot.exe']);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}

export function changePackageIcon() {
	return new Promise((resolve) => {
		resourceHacker({
			operation: 'addoverwrite',
			input: 'dist/repeatBot.exe',
			output: 'dist/repeatBot.exe',
			resource: 'icons/icon.ico',
			resourceType: 'ICONGROUP',
			resourceName: '1',
		}, (err) => {
			if (err) console.error(err);
			resolve(!err);
		});
	});
}
