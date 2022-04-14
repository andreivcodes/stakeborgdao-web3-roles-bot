const { Client, Intents } = require("discord.js");
import * as Realm from "realm-web";

export default function handler(req, res) {
  let address = req.body.address;
  let uid = req.body.uid;

  const client = new Client({
    intents: [Intents.FLAGS.GUILDS],
    autoReconnect: true,
  });

  client.on("ready", async () => {
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

    if (explorerData) {
      if (parseInt(explorerData.wallet) >= 10) {
        let member = await myGuild.members.fetch(uid);
        await member.roles.add(holderRole);
      }
      if (parseInt(explorerData.governanceStaking) >= 10) {
        let member = await myGuild.members.fetch(uid);
        await member.roles.add(stakerRole);
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
