const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("config");
const WebHooks = require('node-webhooks');
const express = require("express");
const myParser = require("body-parser");
const fs = require('fs');
const app = express();
let currentComponent;

client.on('ready', () => {
 	discordClientCBS.forEach((cb) => {
 		cb();
 	});
 	console.log(`DISCORD Logged in as ${client.user.username}!`);
 });

 client.login(config.get('discord.token'));

 let discordClientCBS = [];
 const getDiscordClient = (cb) => {
 	if (client.status === 0) return cb();
 	else discordClientCBS.push(cb);
 };

 const logToDiscord = (message, critical, extraFields, cb = ()=>{}) => {
 	getDiscordClient(() => {
 		let richEmbed = new Discord.RichEmbed();
 		richEmbed.setAuthor(config.get("alerterName"), config.get("favicon"), config.get("statusPage"));
        if (critical === true) {
            richEmbed.setColor("#d9534f");
        } else if (critical === false) {
            richEmbed.setColor("#4ca74c");
        }
 		richEmbed.setDescription(message);
 	// 	richEmbed.setFooter("Footer", "https://musare.com/favicon-194x194.png");
 	// 	richEmbed.setImage("https://musare.com/favicon-194x194.png");
 		richEmbed.setThumbnail(config.get("thumbail"));
 		richEmbed.setTimestamp(new Date());
 		richEmbed.setTitle(config.get("alertName"));
 		richEmbed.setURL(config.get("statusPage"));
        if(typeof extraFields !== 'undefined' && extraFields) {
            extraFields.forEach((extraField) => {
     			richEmbed.addField(extraField.name, extraField.value, extraField.inline);
     		});
        }
 		client.channels.get(config.get('discord.loggingChannel')).sendEmbed(richEmbed).then(() => {
 			cb();
 		}).then((reason) => {
 			cb(reason);
 		});
 	});
 };

app.use(myParser.urlencoded({extended : true}));
app.post("/", function(request, response) {
    let alertType = request.body.alertTypeFriendlyName;
    if (alertType === "Up") {
        var critical = false;
    } else if (alertType === "Down") {
        var critical = true;
    }
    logToDiscord(config.get("alertDescription"), critical, [{name: "Name:", value: request.body.monitorFriendlyName, inline: false}, {name: "URL:", value: request.body.monitorURL, inline: false}, {name: "Status:", value: request.body.alertTypeFriendlyName, inline: false}]);
    response.end('{"success" : "Logged Successfully", "status" : 200}');
});

app.listen(config.get("listenerPort"));
