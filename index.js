import {Client,Collection,Events,GatewayIntentBits} from "discord.js"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
// import config from "config.json"
// import config from "./config.json" assert {type:"json"}

// const prefix=config.prefix
const client=new Client({ intents:[GatewayIntentBits.Guilds] })
dotenv.config()


client.commands = new Collection();

const commandsPath = path.join(new URL('.', import.meta.url).pathname, 'command');

if (!fs.existsSync(commandsPath)) {
    console.error(`Error: Directory '${commandsPath}' does not exist.`);
  fs.mkdirSync(commandsPath);
}
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
	console.log('Ready!');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});
// try{
//     client.commands=new Collection()
//     const commandsPath = path.join(__dirname, "command");
//     const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
//     for(const file of commandFiles){
//         const filePath = path.join(commandsPath, file)
//         const command = require(filePath)
//         // Set a new item in the Collection with the key as the command name and the value as the exported module
//         if("data" in command && "execute" in command){
//             client.commands.set(command.data.name,command)
//         }else{
//             console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
//         }
//     }
// }catch(error){
//     console.error(error.stack)
//     const stackLines=error.stack.split("\n")
//     const line=stackLines[1].trim().substring(3)
//     console.log("there has an "+error+" in "+line)
// }

client.once(Events.ClientReady,function(e){
	console.log(`Ready! Logged in as ${e.user.tag}`);
    //? client.user.setActivity(" 輸入main!help來獲得使用方式",{type:"WATCHING"})
})

client.login(process.env.TOKEN_HIHI)