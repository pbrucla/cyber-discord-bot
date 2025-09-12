import { google } from "googleapis"
import { authorize } from "../utilities/google-auth.js"
import fs from "fs"
import { ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js"
import axios from "axios"
import stream from "stream"

export const data = new ContextMenuCommandBuilder().setName("upload photos").setType(ApplicationCommandType.Message)

export async function execute(interaction) {
  if (!interaction.isMessageContextMenuCommand()) return
  const message = await interaction.channel.messages.fetch(interaction.targetId)
  await interaction.deferReply() // Discord requires an acknowledgement within 3 seconds. this allows the response to be deferred, with an "<application> is thinking..." response in the meantime

  if (!interaction.member.roles.cache.some(role => role.name === "officer")) {
    interaction.editReply("Insufficient permissions.")
  } else if (!process.env.FOLDER_ID) {
    interaction.editReply("No folder id found. Please specify it in .env.")
  } else {
    let auth = await authorize()
    const drive = google.drive({ version: "v3", auth })
    let count = 0
    let failedCount = 0
    let failedFiles = []
    let editedReply = ""

    for (const [key, value] of message["attachments"]) {
      if (!value["contentType"] || !value["contentType"].startsWith("image/")) continue // make sure to only upload images
      try {
        const response = await axios.get(value["url"], { responseType: "arraybuffer" })
        const buffer = Buffer.from(response.data)
        const bufferStream = new stream.PassThrough()
        bufferStream.end(buffer)
        const fileMetadata = {
          name: value["name"],
          parents: [process.env.FOLDER_ID], // folder id
        }
        const media = {
          mimeType: value["contentType"],
          body: bufferStream,
        }
        // upload the photo
        const res = await drive.files.create({
          resource: fileMetadata,
          media,
          fields: "id",
        })
        count++
      } catch (error) {
        failedCount++
        failedFiles.push(`(name: ${value["name"]}, id: ${value["id"]})`)
        console.error(`Error uploading file with id ${value["id"]}:`, error)
        if (error["code"] === 404)
          editedReply =
            "404 error; please make sure the folder's id has been specified correctly and the bot has Editor access to the folder.\n"
        else if (error["code"] === 403)
          editedReply = "403 error; please make sure the bot has Editor access to the folder.\n"
      }
    }

    // update the message with the results and any failures
    if (count === 1) {
      editedReply += "1 photo uploaded! "
    } else {
      editedReply += `${count} photos uploaded! `
    }
    if (failedCount === 1) {
      editedReply += "1 photo was not uploaded: " + failedFiles[0]
    } else if (failedCount > 0) {
      editedReply += `${failedCount} photos were not uploaded: `
      for (let i = 0; i < failedFiles.length - 1; i++) {
        editedReply += failedFiles[i] + ", "
      }
      editedReply += failedFiles[failedFiles.length - 1]
    }
    interaction.editReply(editedReply)
  }
}
