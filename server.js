const config = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();
const get = require('./src/utils/fetch.js');
const cheerio = require('cheerio');
const HashTable = require('./src/utils/HashTable.js');
const Player = require('./src/utils/Player.js');
const Goalie = require('./src/utils/Goalie.js');
const FuzzySet = require('fuzzyset.js');
const fs = require('fs');
const playerTable = new HashTable(150);
let fuzzset;
let season = 'S46';
let type = 'Season';

// gather our initial data.

get(`http://simulationhockey.com/games/shl/${season}/${type}/SHL-ProTeamScoring.html`).then(res => {
  let $ = cheerio.load(res);
  $('*[id^="STHS_JS_Team_"] .STHSScoring_PlayersTable1 tbody tr').each(function(){
    let $tds = $(this).find('td');

    let name = $tds.eq(0).text().split("(TOT)").filter(Boolean)[0].split("(R)").filter(Boolean)[0].trim();
    if (name.startsWith('__')) {
      return;
    }

    // create player object and add all possible data to it
    let P = new Player(name);
    P.team = $(this).parent().parent().parent()['0'].attribs.id
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
  });

  // allows us to continue using the res after we finish the first part
  return res;
}).then(res => {
  let $ = cheerio.load(res);
  $('*[id^="STHS_JS_Team_"] .STHSScoring_PlayersTable2 tbody tr').each(function() {
    //console.log("\n\n" + this.attribs.id);
    let $tds = $(this).find('td');

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
  });

  return res;
}).then(res => {
  let $ = cheerio.load(res);
  $('*[id^="STHS_JS_Team_"] .STHSScoring_GoaliesTable tbody tr').each(function() {
    let $tds = $(this).find('td');

    let name = $tds.eq(0).text().split("(TOT)").filter(Boolean)[0].split("(R)").filter(Boolean)[0].trim();
    if (name.startsWith('__')) {
      return;
    }


    let P = new Goalie(name);
    P.team = $(this).parent().parent().parent()['0'].attribs.id
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
  });

}).catch(e => {
  console.log(e);
});

get(`http://simulationhockey.com/games/smjhl/${season}/${type}/SMJHL-ProTeamScoring.html`).then(res => {
  let $ = cheerio.load(res);
  $('*[id^="STHS_JS_Team_"] .STHSScoring_PlayersTable1 tbody tr').each(function() {
    let $tds = $(this).find('td');
    let name = $tds.eq(0).text().split("(TOT)").filter(Boolean)[0]
    name = name.split("(R)").filter(Boolean)[0].trim();
    if (name.startsWith('__')) {
      return;
    }

    // create player object and add all possible data to it
    let P = new Player(name);
    P.team = $(this).parent().parent().parent()['0'].attribs.id
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
  });

  // allows us to continue using the res after we finish the first part
  return res;
}).then(res => {
  let $ = cheerio.load(res);
  $('*[id^="STHS_JS_Team_"] .STHSScoring_PlayersTable2 tbody tr').each(function() {

    let $tds = $(this).find('td');

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
  });

  return res;
}).then(res => {
  let $ = cheerio.load(res);
  $('*[id^="STHS_JS_Team_"] .STHSScoring_GoaliesTable tbody tr').each(function() {
    let $tds = $(this).find('td');

    let name = $tds.eq(0).text().split("(TOT)").filter(Boolean)[0].split("(R)").filter(Boolean)[0].trim();
    if (name.startsWith('__')) {
      return;
    }


    let P = new Goalie(name);
    P.team = $(this).parent().parent().parent()['0'].attribs.id
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
  });
}).catch(e => {
  console.log(e);
});

setTimeout(() => {
  fuzzset = FuzzySet(playerTable.getKeys())
  console.log("Data Collected and ready for input");
}, 1 * 1000);


client.on('ready', () => {
  console.log(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`)
});

client.on('message', msg => {
  if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;
  let args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
  let command = args.shift().toLowerCase();
  let users = JSON.parse(fs.readFileSync('data/saved_users.json', 'utf8'));

  // parse commands
  if ((command === 'player') || command === 'p') {
    let query = users[msg.author.id] && (args === undefined || args.length == 0) ? users[msg.author.id].player : args.join(' ');
    let results = fuzzset.get(query);
    if (results.length === 0) {
      // if there is no such player
      msg.channel.send({
        embed: {
          color: 0xCF000E,
          description: 'Sorry, I couldn\'t find that player. Note that players will not show up if they are not in the playoffs'
        }
      });
      return;
    }
    // give the most relevant result
    msg.channel.send(playerTable.get(results[0][1]).toRichEmbed());

  } else if (comment === 'store') {
    let query = args.join(' ');
    let results = fuzzset.get(query);
    if (results.length === 0) {
      msg.channel.send({
        embed: {
          color: 0xCF000E,
          description: "Sorry, I couldn't find that player."
        }
      })
      return;
    }
    let P = playerTable.get(results[0][1]);
    users[msg.author.id] = {
      player: P.name,
      team: P.team
    }
    fs.writeFile("data/myPlayer.json", JSON.stringify(users), err => {
      if (err) console.error(err)
    });
    msg.channel.send({
      embed: {
        color: 0x61E442,
        description: "You have successfully been added to the database!"
      }
    })
  }
});

client.login(config.token);

// every 5 minutes, update the data
setInterval(() => {
  get(`http://simulationhockey.com/games/shl/${season}/${type}/SHL-ProTeamScoring.html`).then(res => {
    let $ = cheerio.load(res);
    $('*[id^="STHS_JS_Team_"] .STHSScoring_PlayersTable1 tbody tr').each(function(){
      let $tds = $(this).find('td');

      let name = $tds.eq(0).text().split("(TOT)").filter(Boolean)[0].split("(R)").filter(Boolean)[0].trim();
      if (name.startsWith('__')) {
        return;
      }

      // create player object and add all possible data to it
      let P = new Player(name);
      P.team = $(this).parent().parent().parent()['0'].attribs.id
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
    });

    // allows us to continue using the res after we finish the first part
    return res;
  }).then(res => {
    let $ = cheerio.load(res);
    $('*[id^="STHS_JS_Team_"] .STHSScoring_PlayersTable2 tbody tr').each(function() {
      //console.log("\n\n" + this.attribs.id);
      let $tds = $(this).find('td');

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
    });

    return res;
  }).then(res => {
    let $ = cheerio.load(res);
    $('*[id^="STHS_JS_Team_"] .STHSScoring_GoaliesTable tbody tr').each(function() {
      let $tds = $(this).find('td');

      let name = $tds.eq(0).text().split("(TOT)").filter(Boolean)[0].split("(R)").filter(Boolean)[0].trim();
      if (name.startsWith('__')) {
        return;
      }


      let P = new Goalie(name);
      P.team = $(this).parent().parent().parent()['0'].attribs.id
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
    });

  }).catch(e => {
    console.log(e);
  });



  get(`http://simulationhockey.com/games/smjhl/${season}/${type}/SMJHL-ProTeamScoring.html`).then(res => {
    let $ = cheerio.load(res);
    $('*[id^="STHS_JS_Team_"] .STHSScoring_PlayersTable1 tbody tr').each(function() {
      let $tds = $(this).find('td');
      let name = $tds.eq(0).text().split("(TOT)").filter(Boolean)[0]
      name = name.split("(R)").filter(Boolean)[0].trim();
      if (name.startsWith('__')) {
        return;
      }

      // create player object and add all possible data to it
      let P = new Player(name);
      P.team = $(this).parent().parent().parent()['0'].attribs.id
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
    });

    // allows us to continue using the res after we finish the first part
    return res;
  }).then(res => {
    let $ = cheerio.load(res);
    $('*[id^="STHS_JS_Team_"] .STHSScoring_PlayersTable2 tbody tr').each(function() {

      let $tds = $(this).find('td');

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
    });

    return res;
  }).then(res => {
    let $ = cheerio.load(res);
    $('*[id^="STHS_JS_Team_"] .STHSScoring_GoaliesTable tbody tr').each(function() {
      let $tds = $(this).find('td');

      let name = $tds.eq(0).text().split("(TOT)").filter(Boolean)[0].split("(R)").filter(Boolean)[0].trim();
      if (name.startsWith('__')) {
        return;
      }


      let P = new Goalie(name);
      P.team = $(this).parent().parent().parent()['0'].attribs.id
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
    });
  }).catch(e => {
    console.log(e);
  });

  setTimeout(() => {
    fuzzset = FuzzySet(playerTable.getKeys())
    console.log("Data Updated");
  }, 1 * 1000);
}, 5 * 60 * 1000);
