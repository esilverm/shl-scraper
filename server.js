const config = require('./config.json');
const rp = require('request-promise');
const Discord = require('discord.js');
const client = new Discord.Client();
const get = require('./src/utils/fetch.js');
const cheerio = require('cheerio');
const HashTable = require('./src/utils/HashTable.js');
const Player = require('./src/utils/Player.js');
const Goalie = require('./src/utils/Goalie.js');
const TeamStanding = require('./src/utils/TeamStanding.js');
const LeagueStanding = require('./src/utils/LeagueStanding.js');
const FuzzySet = require('fuzzyset.js');
const fs = require('fs');
const playerTable = new HashTable(150);
const teamStandingsTable = new HashTable();
const leagueStandingsTable = new HashTable();
let fuzzset;
let fuzzsetteamstandings;
let season = 'S48';
let type = 'Season'; //Season
let jtype = 'Season';
let type2 = '';
// gather our initial data.
let init = (async () => {
  await gatherAllPlayerData();
  await gatherAllTeamStandingsData();
})();

client.on('ready', () => {
  console.log(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`)
  /**
  for (let i = 0; i < client.guilds.size; i++) {
    console.log(client.guilds.array()[i].name);
  }**/
});

client.on("error", (e) => {
  fs.writeFile("logs.txt", e, err => {
      if (err) console.error(err)
  });
});

client.on('message', msg => {
  if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;
  let args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
  let command = args.shift().toLowerCase();
  let users = JSON.parse(fs.readFileSync('data/saved_users.json', 'utf8'));

  // parse commands
  if ((command === 'player') || command === 'p') {
      if (msg.guild !== null) {
        //fs.appendFileSync('lookups.txt', "\n" + msg.author.username + " in " + msg.guild.name);
        console.log(msg.author.username + " in " + msg.guild.name);
      }
    let query = users[msg.author.id] && (args === undefined || args.length == 0) ? users[msg.author.id].player : args.join(' ');
    let results = fuzzset.get(query);
    if (results === null || results[0][0] < 0.8) {
      // if there is no such player
      msg.channel.send({
        embed: {
          color: 0xCF000E,
          description: 'Sorry, I couldn\'t find that player. Note that players will not show up if they have not played a game in the current season or playoffs.' + extraerrmsg
        }
      });
      return;
    }
    // give the most relevant result
    msg.channel.send(playerTable.get(results[0][1]).toRichEmbed());

  } else if (command === 'store') {
    if (msg.guild !== null) {
      //fs.appendFileSync('lookups.txt', "\n" + msg.author.username + " in " + msg.guild.name);
      console.log(msg.author.username + " in " + msg.guild.name);
    }
    let query = args.join(' ');
    let results = fuzzset.get(query);
    if (results === null || results[0][0] < 0.8) {
      msg.channel.send({
        embed: {
          color: 0xCF000E,
          description: 'Sorry, I couldn\'t find that player. Note that players will not show up if they have not played a game in the current season or playoffs.' + extraerrmsg
        }
      })
      return;
    }
    let P = playerTable.get(results[0][1]);
    users[msg.author.id] = {
      player: P.name,
      team: P.team
    }
    fs.writeFile("data/saved_users.json", JSON.stringify(users), err => {
      if (err) console.error(err)
    });
    msg.channel.send({
      embed: {
        color: 0x61E442,
        description: "You have successfully been added to the database!"
      }
    })
  } else if (command === 'random' || command === 'r') {
    if (msg.guild !== null) {
      //fs.appendFileSync('lookups.txt', "\n" + msg.author.username + " in " + msg.guild.name);
      console.log(msg.author.username + " in " + msg.guild.name);
    }
    let players = playerTable.getKeys();
    let random = Math.floor(Math.random() * players.length);


    msg.channel.send(playerTable.get(players[random]).toRichEmbed());

  } else if (command === 'bang') {
    // wts Halifax
    let r = Math.random();
    if (r <= 0.1) {
      msg.channel.send("DON'T SHOOT ME!!!!!");
    }
  } else if (command === 'team'){
    if (type != "Season"){
      msg.channel.send({
        embed: {
          color: 0xCF000E,
          description: 'Sorry, this feature is only available during the regular season.'
        }
      });
      return;
    }
    let query = args.join(' ');
    let results = fuzzsetteamstandings.get(query);
    if (results === null || results[0][0] < 0.5) {
      // if there is no such team standing
      msg.channel.send({
        embed: {
          color: 0xCF000E,
          description: 'Sorry, I couldn\'t find that team. Note that teams will not show up if they have not played a game in the current season or playoffs.'
        }
      });
      return;
    }
    // give the most relevant result
    msg.channel.send(teamStandingsTable.get(results[0][1]).toRichEmbed());
  } else if (command === 'standings'){
    if (type != "Season"){
      msg.channel.send({
        embed: {
          color: 0xCF000E,
          description: 'Sorry, this feature is only available during the regular season.'
        }
      });
      return;
    }
    let query = args.join(' ');
    query = query.toUpperCase();
    if (query != "SHL" && query != "SMJHL"){
      msg.channel.send({
        embed: {
          color: 0xCF000E,
          description: 'Sorry, currently the only supported leagues are the SHL and the SMJHL.'
        }
      });
      return;
    }
    msg.channel.send(leagueStandingsTable.get(query).toRichEmbed());
  }
});

client.login(config.token);

// every 5 minutes, update the data
setInterval(() => {
  let init = (async () => {
    await gatherAllPlayerData();
    await gatherAllTeamStandingsData();
  })();
}, 5 * 60 * 1000);

async function gatherAllPlayerData(){
  await gatherPlayerDataByLeague("SHL");
  await gatherPlayerDataByLeague("SMJHL");

  fuzzset = await FuzzySet(playerTable.getKeys());
  console.log("Player Data Collected and ready for input");
}

async function gatherPlayerDataByLeague(league){
  // fetch player data for league
  await rp({
    uri:`http://simulationhockey.com/games/${league.toLowerCase()}/${season}/${league === "SHL" ? type : jtype}/${league}${type2}-ProTeamScoring.html`,
    transform: (body) => cheerio.load(body)
  }).then(async ($) => {
    let rows = $('*[id^="STHS_JS_Team_"] .STHSScoring_PlayersTable1 tbody tr').toArray();
    let promises = rows.map((i) => $(i)).map(handlePlayerStats1);

    await Promise.all(promises);
    return $;
  }).then(async ($) => {
    let rows = $('*[id^="STHS_JS_Team_"] .STHSScoring_PlayersTable2 tbody tr').toArray();
    let promises = rows.map((i) => $(i)).map(handlePlayerStats2);

    await Promise.all(promises);
    return $;
  }).then (async ($) => {
    let rows = $('*[id^="STHS_JS_Team_"] .STHSScoring_GoaliesTable tbody tr').toArray();
    let promises = rows.map((i) => $(i)).map(handleGoalieStats);

    await Promise.all(promises);
  }).catch(err => {
    console.log(err);
  })
}

async function handlePlayerStats1(row) {
  let $tds = row.find('td');

  let name = $tds.eq(0).text().split("(TOT)").filter(Boolean)[0].split("(R)").filter(Boolean)[0].trim();
  if (name.startsWith('__')) {
    return;
  }

  // create player object and add all possible data to it
  let P = new Player(name);
  P.team = row.parent().parent().parent()['0'].attribs.id
                  .replace('STHS_JS_Team_', '')
                  .match(/[A-Z][a-z]+/g).join(' ');

  P.position = ['Forward', 'Defenseman'][$tds.eq(1).text() === 'X' ? 0 : 1];
  P.rookie = $tds.eq(0).text().split('(R)').length > 1;
  P.games = +$tds.eq(3).text();
  P.goals = +$tds.eq(4).text();
  P.assists = +$tds.eq(5).text();
  P.plusminus = +$tds.eq(7).text();
  P.pim = +$tds.eq(8).text();
  P.hits = +$tds.eq(10).text();
  P.shots = +$tds.eq(12).text();
  P.shotblock = +$tds.eq(16).text();
  P.minutes = +$tds.eq(17).text();
  P.ppg = +$tds.eq(19).text();
  P.ppa = +$tds.eq(20).text();
  P.pkg = +$tds.eq(24).text();
  P.pka = +$tds.eq(25).text();
  // consider changing key to a more human-typeable name later on
  // or do https://en.wikipedia.org/wiki/Levenshtein_distance on the keys
  // could use https://glench.github.io/fuzzyset.js/ when people search
  //
  playerTable.set(name, P);
}

async function handlePlayerStats2(row) {
  let $tds = row.find('td');

  let name = $tds.eq(0).text().split("(TOT)").filter(Boolean)[0].split("(R)").filter(Boolean)[0].trim();
  if (name.startsWith('__')) {
    return;
  }


  let P = playerTable.get(name);
  P.gwg = +$tds.eq(3).text();
  P.faceoffwins = Math.round((+$tds.eq(5).text().replace("%", "") / 100) * +$tds.eq(6).text())
  P.faceofftotal = +$tds.eq(6).text();
  P.hattricks = +$tds.eq(10).text();

  playerTable.set(name, P);
};

async function handleGoalieStats(row) {
  let $tds = row.find('td');

  let name = $tds.eq(0).text().split("(TOT)").filter(Boolean)[0].split("(R)").filter(Boolean)[0].trim();
  if (name.startsWith('__')) {
    return;
  }


  let P = new Goalie(name);
  P.team = row.parent().parent().parent()['0'].attribs.id
                  .replace('STHS_JS_Team_', '')
                  .match(/[A-Z][a-z]+/g).join(' ');

  P.games = +$tds.eq(1).text();
  P.wins = +$tds.eq(2).text();
  P.losses = +$tds.eq(3).text();
  P.otlosses = +$tds.eq(4).text();
  P.minutes = +$tds.eq(7).text();
  P.shutouts = +$tds.eq(9).text();
  P.ga = +$tds.eq(10).text();
  P.sa = +$tds.eq(11).text();

  playerTable.set(name, P);
}

async function gatherAllTeamStandingsData(){
  await gatherStandingsDataByLeague("SHL");
  await gatherStandingsDataByLeague("SMJHL");

  fuzzsetteamstandings = await FuzzySet(teamStandingsTable.getKeys());
  console.log("Team Standings Data Collected and ready for input");
}

async function gatherStandingsDataByLeague(league){
  if (type != "Season"){
    return;
  }
  // fetch player data for league
  await rp({
    uri:`http://simulationhockey.com/games/${league.toLowerCase()}/${season}/${type}/${league}${type2}-ProStanding.html`,
    transform: (body) => cheerio.load(body)
  }).then(async ($) => {
    //let rows = $('*[id^="tabmain2"] tbody tr').toArray();
    let counter = 0;
    let conferenceNames = [];
    let leagueStanding = new LeagueStanding(league);
    $('*[id^="tabmain2"] h2').each(function (i, element){
      let header = $(this).text();
      conferenceNames.push(header);
    });

    $('*[id^="tabmain2"] tbody').each(async function (i, element){
      let teamRows = $(this).children('tr').toArray();
      let promises = teamRows.map((i) => $(i)).map(
        function (i){ return handleTeamStandings(i, leagueStanding, conferenceNames[counter]); }
      );
  
      counter++;
      await Promise.all(promises);
    });

    leagueStandingsTable.set(league, leagueStanding);
    return $;
  }).catch(err => {
    console.log(err);
  })
}

async function handleTeamStandings(row, league, conference) {
  let $tds = row.find('td');
  if (league.leagueName == "SHL"){
    $tds.splice(7, 1); //removes the ROW column
  }
  
  let teamStanding = new TeamStanding();

  teamStanding.conference = conference;
  teamStanding.po = $tds.eq(0).text();
  teamStanding.team = $tds.eq(1).text();
  teamStanding.teamstyle = teamStanding.team.split('.').join("");
  teamStanding.gamesplayed = +$tds.eq(2).text();
  teamStanding.wins = +$tds.eq(3).text();
  teamStanding.losses = +$tds.eq(4).text();
  teamStanding.otlosses = +$tds.eq(5).text();
  teamStanding.points = +$tds.eq(6).text();
  teamStanding.goalsfor = +$tds.eq(7).text();
  teamStanding.goalsagainst = +$tds.eq(8).text();
  teamStanding.goaldiff = +$tds.eq(9).text();
  teamStanding.percentage = +$tds.eq(10).text();
  teamStanding.home = $tds.eq(11).text();
  teamStanding.visitor = $tds.eq(12).text();
  teamStanding.last10 = $tds.eq(13).text();
  teamStanding.homelast10 = $tds.eq(14).text();
  teamStanding.visitorlast10 = $tds.eq(15).text();
  teamStanding.streak = $tds.eq(16).text();

  teamStandingsTable.set(teamStanding.team, teamStanding);
  league.addTeamStanding(teamStanding);
}
