# secret-roles

## .env

The following are the supported environment variables

These are required:
`CLIENT_ID` Bot's client id
`TOKEN` Your token which should be handled securely

These are optional:

`GUILD_ID` Optional. Only used for deploying commands to a specific server.

## Start it up

Run command `npm run start`

## Deploy Commands

Run command `npm run deploy-commands`

## Docker

Start it on docker using

I dont have this published anywhere so you will need to build it.

Running it from docker is easy. It doesnt need ports open since it uses webhooks.

`docker run --env-file=".env" secret-roles`

`docker run --env-file=".env" secret-roles npm run deploy-commands`