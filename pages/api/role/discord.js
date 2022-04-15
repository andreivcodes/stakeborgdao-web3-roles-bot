const { Client, Intents } = require("discord.js");
import * as Realm from "realm-web";
import Web3 from "web3";
import governance_staking_abi from "./abi/governance_staking.json";
import moment from "moment";

export default function handler(req, res) {
  let address = req.body.address;
  let uid = req.body.uid;

  const client = new Client({
    intents: [Intents.FLAGS.GUILDS],
    autoReconnect: true,
  });

  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NODE));
  const governance_staking_dao_contract_adress =
    "0xbA319F6F6AC8F45E556918A0C9ECDDE64335265C";
  let governance_staking_contract = new web3.eth.Contract(
    governance_staking_abi,
    governance_staking_dao_contract_adress
  );

  client.on("ready", async () => {
    let myGuild = await client.guilds.cache.get("901898461568442458");
    let holderRole = await myGuild.roles.cache.get("963918748182511626");
    let stakerRole = await myGuild.roles.cache.get("963919106501918800");
    let diamondHandsRole = await myGuild.roles.cache.get("964473109350588426");

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

        let stakedUntil = await governance_staking_contract.methods
          .userLockedUntil(address)
          .call();

        let now = moment(new Date());
        let end = moment(stakedUntil);
        let duration = moment.duration(now.diff(end));
        let days = duration.asDays();

        if (days > 30) {
          await member.roles.add(diamondHandsRole);
        }
      }
    }

    client.destroy();
    res.status(200).send();
  });

  client.on("error", (error) => {
    console.log(error);
    res.status(400).send();
  });

  client.login(process.env.BOT_TOKEN);
}
