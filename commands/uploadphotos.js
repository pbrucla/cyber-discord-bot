import { google } from "googleapis"
import { authorize } from "../utilities/google-auth.js"
import fs from "fs"
import { ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js"
import axios from "axios"
import path from "path"

export const data = new ContextMenuCommandBuilder().setName("upload photos").setType(ApplicationCommandType.Message)

export async function execute(interaction) {
  if (!interaction.isMessageContextMenuCommand()) return
  const message = await interaction.channel.messages.fetch(interaction.targetId)
  await interaction.deferReply() // Discord requires an acknowledgement within 3 seconds. this allows the response to be deferred, with an "<application> is thinking..." response in the meantime

  let auth = await authorize()
  const drive = google.drive({ version: "v3", auth })
  const folderId = "[FOLDER ID]" // replace this with the id of the desired folder (the part of the url after "folders/")
  const downloadDir = path.join(import.meta.dirname, "..", "downloads")
  let count = 0

  for (const [key, value] of message["attachments"]) {
    if (value["contentType"].substring(0, 5) !== "image") continue
    /* credit to https://github.com/ZacTimTam/Upload-To-GDrive-Discord-Bot/tree/main for the WriteStream sections */
    try {
      const filePath = path.join(downloadDir, value["name"])
      const response = await axios.get(value["url"], { responseType: "stream" })
      const writer = fs.createWriteStream(filePath)
      response.data.pipe(writer)
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve)
        writer.on("error", reject)
      })

      const res = await drive.files.create({
        requestBody: {
          name: value["title"],
          mimeType: value["contentType"],
          parents: [folderId],
        },
        media: {
          mimeType: value["contentType"],
          body: fs.createReadStream(filePath),
        },
      })
      // console.log(res.data);
      await fs.promises.unlink(filePath)
      count++
    } catch (error) {
      console.error(`Failed to process file ${value["name"]}:`, error)
    }
  }
  if (count === 1) {
    interaction.editReply(`1 photo uploaded!`)
  } else {
    interaction.editReply(`${count} photos uploaded!`)
  }
}
