import {readFileSync, writeFileSync, unlinkSync} from 'fs';

import {Config} from './types';
import input from './input';
import Bot from './Bot';
import validateConfig from './validateConfig';

export default class Main {
	config: Config = null;
	bot: Bot;

	constructor() {
		this.run();
	}

	async run() {
		this.infoLog('Fetching config.json confguration file');
		const configFile = this.getConfig();
		if (!configFile) await this.setUpConfigFile();
		this.bot = new Bot(this, () => {
			[
				'Welcome to the repeat bot!',
				'How to use:',
				'	* Type \'!users list\' to view all users that are currently being repeated',
				'	* Type \'!users add @user\' to add a user to the list of users to be repeated',
				'	* Type \'!users remove @user\' to remove a user from the list of users to be repeated',
			].forEach(this.infoLog);
			this.beginUserPromt();
		});
	}

	async setUpConfigFile() {
		const token = await input('Enter your Discord token: ');
		const ownerId = await input('Enter the admin\'s Discord user ID: ');
		this.config = {
			token,
			ownerId,
		};
	}

	async beginUserPromt() {
		const userId = await input('Enter the Discord user ID of the admin user: ');
		this.config.ownerId = userId;
		this.setConfig(this.config);
		this.beginUserPromt();
	}

	addUser(userId: string) {
		if (this.config.users.includes(userId)) return;
		this.config.users.push(userId);
		this.setConfig(this.config);
	}

	removeUser(userId: string) {
		this.config.users = this.config.users.filter((id) => id !== userId);
		this.setConfig(this.config);
	}

	setConfig(configFile: Config) {
		try {
			writeFileSync('./config.json', JSON.stringify(configFile));
			this.config = configFile;
		} catch (err) {
			this.errorLog('Failed to write config file', err);
		}
	}

	getConfig(): Config {
		// Check if config file has already been loaded
		if (this.config) return this.config;
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
			this.config = validateConfig(JSON.parse(configFile));
		} catch (err) {
			this.warningLog(`Error in config file: ${err.message}`);
			this.warningLog('Invalid config.json file, deleting and initializing a new one');
			this.config = null;
			this.deleteConfigFile();
			return null;
		}
		return this.config;
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
