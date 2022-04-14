const { Client, Intents } = require("discord.js");
import * as Realm from "realm-web";

export default function handler(req, res) {
  let address = req.body.address;
  let uid = req.body.uid;

  console.log(`address: ${address}`);
  console.log(`uid: ${uid}`);

  const client = new Client({
    intents: [Intents.FLAGS.GUILDS],
    autoReconnect: true,
  });

  client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    let myGuild = await client.guilds.cache.get("901898461568442458");
    let holderRole = await myGuild.roles.cache.get("963918748182511626");
    let stakerRole = await myGuild.roles.cache.get("963919106501918800");

    const app = new Realm.App({ id: process.env.REALM_APP_ID });
    const credentials = Realm.Credentials.apiKey(process.env.REALM_KEY);

    await app.logIn(credentials);
    const mongoclient = app.currentUser.mongoClient("mongodb-atlas");
    let dbresult = await mongoclient
      .db("stakeborgdao-explorer")
      .collection("snapshot")
      .find({}, { sort: { snapshot: -1 }, limit: 1 });

    let dbdata = dbresult[0];

    let data = dbdata.data;

    const explorerData = data.find(
      (element) => element.address.toUpperCase() == address.toUpperCase()
    );

    console.log(explorerData);
    if (explorerData) {
      if (parseInt(explorerData.wallet) >= 10) {
        let member = await myGuild.members.fetch(uid);
        await member.roles.add(holderRole);
        console.log(
          `Gave holder role to ${member.nickname} for ${parseInt(
            explorerData.wallet
          )} tokens in wallet`
        );
      }
      if (parseInt(explorerData.governanceStaking) >= 10) {
        let member = await myGuild.members.fetch(uid);
        console.log(JSON.stringify(member));
        await member.roles.add(stakerRole);
        console.log(
          `Gave staker role to ${member.nickname} for ${parseInt(
            explorerData.governanceStaking
          )} tokens in governance staking`
        );
      }
    }

    client.destroy();
  });

  client.on("error", (error) => {
    console.log(error);
  });

  client.login(process.env.BOT_TOKEN);

  res.status(200).send();
}
