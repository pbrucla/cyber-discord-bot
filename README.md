# cyber-discord-bot

A Discord bot made for ACM Cyber & Psi Beta Rho. :)

## Setup
0. Install Node and make sure corepack is enabled (`corepack enable`).
1. Download and copy `.env.example` as `.env`
2. Run `pnpm install` to install dependencies
3. Either ask me for your own discord bot user OR Create your own discord bot application: https://discordjs.guide/preparations/setting-up-a-bot-application.html
4. [Invite your discord bot to our shared testing discord server](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#creating-and-using-your-invite-link). If you need admin, let me (Alec) know.
5. Add the token from step 3 into the `.env` in the proper location. Make sure there are no extra spaces between the text and the equals sign!
6. Replace DISCORD_CLIENT_ID with the OAuth Client id of your Discord application.
7. Before making new changes, do `git checkout -b BRANCHNAME` where `BRANCHNAME` is a name for whatever feature you are working on.

## Running
0. Run `pnpm start` to run the bot
- Do NOT run multiple copies of a bot under a single bot token, otherwise weird issues may occur!

## Getting ready to push/Making Pull Request
0. Make commits as needed.
1. `git pull origin --rebase` to make sure your code is up-to-date. If this is unsuccessful, you may need to manually resolve conflicts by editing files
2. `pnpm fix` to enforce coding formatting
3. `git add . && git commit` the prettier change if any files changed
4. `git push origin BRANCHNAME` to push to remote branch of new name
5. Open Pull Request in Github website
