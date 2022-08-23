import {APIEmbed, Client, GatewayIntentBits} from 'discord.js';
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
		this.client.on('messageCreate', async (message) => {
			if (message.author.id === this.main.config.ownerId && message.content.startsWith('!')) {
				const args = message.content.substring(1).split(' ');
				switch (args[0]) {
				case 'users':
					switch (args[1]) {
					case 'list':
						const usersList = this.main.config.users || [];
						message.reply({
							embeds: [Bot.makeEmbed(
								'Users',
								usersList.length ? usersList.map((userId) => `<@${userId}>`).join('\n') : 'No users found!',
							)],
						});
						break;

					case 'add': {
						const userId = args[2]?.match(/\d+/)?.[0];
						try {
							await this.isValidUser(userId);
							this.main.addUser(userId);
							message.reply({
								embeds: [Bot.makeEmbed('User added', `<@${userId}> was added to the list!`)],
							});
							this.main.infoLog(`Added user ${userId} to the list`);
						} catch (err) {
							message.reply({
								embeds: [Bot.makeEmbed('There was an Error', err.message, 0xff0000)],
							});
						}
						break;
					}

					case 'remove': {
						const userId = args[2]?.match(/\d+/)?.[0];
						try {
							await this.isValidUser(userId);
							this.main.removeUser(userId);
							message.reply({
								embeds: [Bot.makeEmbed('User removed', `<@${userId}> was removed from the list!`)],
							});
							this.main.infoLog(`Removed user ${userId} from the list`);
						} catch (err) {
							message.reply({
								embeds: [Bot.makeEmbed('There was an Error', err.message, 0xff0000)],
							});
						}
						break;
					}
					}
					break;
				}
			}
			if (!(message.author.id === this.client.user.id) && this.main.config.users?.includes(message.author.id)) {
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
			await this.client.login(this.main.config.token);
		} catch (err) {
			this.main.errorLog('Failed to login, deleting config file');
			this.main.errorLog('Make sure the token is correct and bot has message content enabled');
			this.main.deleteConfigFile();
			process.exit(1);
		}
	}

	async isValidUser(userId: string): Promise<boolean> {
		if (!userId) throw new Error('The userId could not be found in your message!');
		const user = await this.client.users.fetch(userId);
		if (!user) throw new Error('The user could not be found!');
		return true;
	}

	static makeEmbed(title: string, description: string, color: number = 0x0000ff): APIEmbed {
		return {
			color,
			title,
			description,
		};
	}
}
