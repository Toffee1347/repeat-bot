import {Config} from './types';

export default function validateConfig(config: Config): Config {
	if (!config.token) {
		throw new Error('No token found in config');
	}
	if (!config.ownerId) {
		throw new Error('No ownerId found in config');
	}
	if (!config.users || !Number.isInteger(config.users.length)) {
		throw new Error('No users found in config');
	}
	return config;
}
