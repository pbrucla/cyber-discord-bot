import { ActivityType, Client, Collection, Events, GatewayIntentBits, REST, Routes } from "discord.js"
import dotenv from "dotenv"
import fs from "node:fs/promises"
import path from "node:path"
import url from "node:url"

// load token
dotenv.config()

// init client
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// setup commands from the commands folder
client.commands = new Collection()
const commandsToRegister = []
const commandsPath = path.join(url.fileURLToPath(import.meta.url), "..", "commands")
const commandFiles = (await fs.readdir(commandsPath)).filter(f => f.endsWith(".js"))
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = await import(filePath)
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command)
    commandsToRegister.push(command.data)
  } else {
    throw `The command at ${filePath} is missing a required "data" or "execute" property.`
  }
}

// register commands
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN)
const registerResponse = await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
  body: commandsToRegister,
})
console.log(`Registered ${registerResponse.length} commands!`)

client.on(Events.InteractionCreate, async interaction => {
  let command
  if (interaction.isChatInputCommand()) {
    command = interaction.client.commands.get(interaction.commandName)
  }

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}`, error)
  }
})

client.once(Events.ClientReady, ready => {
  console.log(`Logged in as ${ready.user.tag}!`)
  ready.user.setActivity({
    type: ActivityType.Watching,
    name: "over cybricks",
  })
})

// login to Discord!
client.login(process.env.DISCORD_BOT_TOKEN)
