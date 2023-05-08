# cyber-discord-bot

A Discord bot made for Psi Beta Rho. :)

## Setup
0. Install node and yarn.
1. Download and copy .env.example as .env
2. Run `yarn install` to install dependencies
3. Either ask me for your own discord bot user OR Create your own discord bot application: https://discordjs.guide/preparations/setting-up-a-bot-application.html
4. [Invite your discord bot to our shared testing discord server](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#creating-and-using-your-invite-link). If you need admin, let me (Alec) know.
5. Add the token from step 3 into the .env in the proper location. Make sure there are no extra spaces between the text and the equals sign!
6. Replace GUILD_ID with the server id you are testing in, CLIENT_ID with the discord bot user id, and OWNER_ID with your user id (this is used solely for /eval). Getting IDs: https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-
7. Before making new changes, do `git checkout -b BRANCHNAME` where BRANCHNAME is a name for whatever feature you are working on.

### Google Service Account credentials
- As this bot uses some features of GSuite (Google sheets and google forms), running this bot will require obtaining some credentials. You do NOT need a project with billing enabled to do this.
1. Follow the instructions here (you can ignore the optional steps): [https://cloud.google.com/iam/docs/service-accounts-create](https://cloud.google.com/iam/docs/service-accounts-create)
2. Once in the service account, go to keys --> add key --> create new key --> JSON, download and save this file as `credentials.json`
3. Enable the APIs: Go to Google Workspace --> APIs, and enable the `Google Sheets` and `Google Forms` APIs.

## Running
1. If this is the first time you are running OR you changed the format of slash commands, refresh them by running `yarn deploy`
2. Run `yarn start` to run the bot
- Do NOT run multiple copies of a bot under a single bot token, otherwise weird issues may occur!

## Getting ready to push/Making Pull Request
0. Make commits as needed.
1. `git pull origin --rebase` to make sure your code is up-to-date. If this is unsuccessful, you may need to manually resolve conflicts by editing files
2. `yarn fix` to enforce coding formatting
3. `git add . && git commit` the prettier change if any files changed
4. `git push origin BRANCHNAME` to push to remote branch of new name
5. Open Pull Request in Github website
