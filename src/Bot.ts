import {Client, GatewayIntentBits} from 'discord.js';
import Main from './Main';

export default class Bot {
	client: Client;
	main: Main;
	onReady: () => void;

	constructor(main: Main, onReady: () => void) {
		this.main = main;
		this.onReady = onReady;
		this.main.infoLog('Initializing Discord client');
		this.client = new Client({
			intents: [
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
			],
		});
		this.registerEvents();
		this.login();
	}

	registerEvents() {
		this.main.infoLog('Registering events');
		this.client.on('messageCreate', (message) => {
			if (!(message.author.id === this.client.user.id) && message.author.id === this.main.configFile.userId) {
				message.reply(message.content);
			}
		});
		this.client.on('ready', () => {
			this.main.infoLog(`Logged in as ${this.client.user.tag}`);
			this.onReady();
		});
	}

	async login() {
		try {
			this.main.infoLog('Logging into Discord');
			await this.client.login(this.main.configFile.token);
		} catch (err) {
			this.main.errorLog('Failed to login, deleting config file');
			this.main.errorLog('Make sure the token is correct and bot has message content enabled');
			this.main.deleteConfigFile();
			process.exit(1);
		}
	}
}
