import {createInterface} from 'readline';
const readline = createInterface({
	input: process.stdin,
	output: process.stdout,
});

export default function input(text: string): Promise<string> {
	return new Promise((res) => {
		readline.question(text, (output) =>{
			res(output);
		});
	});
}
