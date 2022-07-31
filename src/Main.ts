import {readFileSync, writeFileSync, unlinkSync} from 'fs';

import {Config} from './types';
import input from './input.js';
import Bot from './Bot';

export default class Main {
	private _configFile: Config = null;
	bot: Bot;

	constructor() {
		this.run();
	}

	async run() {
		this.infoLog('Fetching config.json confguration file');
		const configFile = this.configFile;
		if (!configFile) {
			await this.setUpConfigFile();
		}
		this.bot = new Bot(this, () => {
			// this.beginUserPromt();
		});
	}

	async setUpConfigFile() {
		const token = await input('Enter your Discord token: ');
		const userId = await input('Enter the Discord user ID to repeat: ');
		this.configFile = {
			token,
			userId,
		};
	}

	async beginUserPromt() {
		const userId = await input('Enter the Discord user ID to repeat: ');
		this.configFile.userId = userId;
		this.beginUserPromt();
	}

	set configFile(configFile: Config) {
		try {
			writeFileSync('./config.json', JSON.stringify(configFile));
			this._configFile = configFile;
		} catch (err) {
			this.errorLog('Failed to write config file', err);
		}
	}

	get configFile(): Config {
		// Check if config file has already been loaded
		if (this._configFile) return this._configFile;
		// Load config file
		let configFile: string;
		try {
			configFile = readFileSync('./config.json', 'utf8');
		} catch (err) {
			this.warningLog('No config file found, initializing a new one');
			return null;
		}
		// Parse config file
		try {
			this._configFile = JSON.parse(configFile);
			// Validate config file
			if (!this._configFile.token || !this._configFile.userId) {
				throw new Error('Invalid config file');
			}
		} catch (err) {
			this.warningLog('Invalid config.json file, deleting and initializing a new one');
			this._configFile = null;
			this.deleteConfigFile();
			return null;
		}
		return this._configFile;
	}

	deleteConfigFile() {
		unlinkSync('./config.json');
	}

	infoLog(message: string) {
		console.log(`[INFO] ${message}`);
	}
	warningLog(message: string) {
		console.log(`[WARN] ${message}`);
	}
	errorLog(message: string, error?: Error) {
		console.log(`[ERROR] ${message}${error ? `\n${error.stack}` : ''}`);
	}
}
