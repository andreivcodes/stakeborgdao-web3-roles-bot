const { Client, Intents } = require("discord.js");
import * as Realm from "realm-web";
import Web3 from "web3";
import governance_staking_abi from "./abi/governance_staking.json";
import standard_token_abi from "./abi/standard_token.json";
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
  const standard_token_contract_adress =
    "0xDA0c94c73D127eE191955FB46bACd7FF999b2bcd";
  let governance_staking_contract = new web3.eth.Contract(
    governance_staking_abi,
    governance_staking_dao_contract_adress
  );

  let standard_token = new web3.eth.Contract(
    standard_token_abi,
    standard_token_contract_adress
  );

  client.on("ready", async () => {
    let myGuild = await client.guilds.cache.get("901898461568442458");
    let holderRole = await myGuild.roles.cache.get("963918748182511626");
    let stakerRole = await myGuild.roles.cache.get("963919106501918800");
    let diamondHandsRole = await myGuild.roles.cache.get("964473109350588426");

    try {
      let member = await myGuild.members.fetch(uid);

      if (member) {
        let wallet = await standard_token.methods.balanceOf(address).call();

        let staking = await governance_staking_contract.methods
          .balanceOf(address)
          .call();

        console.log(wallet / (10 ^ 18));
        console.log(staking / (10 ^ 18));

        if (parseInt(wallet) >= 10 * (10 ^ 18)) {
          await member.roles.add(holderRole);
        }

        if (parseInt(staking) >= 10 * (10 ^ 18)) {
          await member.roles.add(stakerRole);

          let stakedUntil = await governance_staking_contract.methods
            .userLockedUntil(address)
            .call();

          let now = moment(new Date());
          let end = moment.unix(stakedUntil);
          let duration = moment.duration(end.diff(now));
          let days = duration.asDays();

          if (days > 30) {
            await member.roles.add(diamondHandsRole);
          }
        }
      }
    } catch (error) {
      console.log(error);
      res.status(400).send();
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
