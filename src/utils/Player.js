const Discord = require("discord.js");
const teamStyles = require("../../data/team_style.json");

module.exports = class Player {
  constructor(playerName) {
    this.name = playerName;
    this.team = '';
    this.position = '';
    this.rookie = false;
    this.games = 0;
    this.goals = 0;
    this.assists = 0;
    this.plusminus = 0;
    this.shots = 0;
    this.pim = 0;
    this.shotblock = 0;
    this.hits = 0;
    this.gwg = 0;
    this.faceoffwins = 0;
    this.faceofftotal = 0;
    this.minutes = 0;
    this.hattricks = 0;
    this.ppg = 0;
    this.ppa = 0;
    this.pkg = 0;
    this.pka = 0;
  }

  toRichEmbed() {
    let points = this.goals + this.assists;
    let shtperc = ((this.goals / this.shots) * 100).toFixed(2);
    let faceperc = ((this.faceoffwins / this.faceofftotal) * 100).toFixed(2);
    let minpergame = (this.minutes / this.games).toFixed(2);
    let pppoints = this.ppg + this.ppa;
    let shpoints = this.pkg + this.pka;
    let ptspergame = (points / this.games).toFixed(2);
    let embed = new Discord.RichEmbed()
                  .setTitle(this.name)
                  .setColor(+teamStyles[this.team].color)
                  .setFooter('© esilverm')
                  .setTimestamp()
                  .setThumbnail(teamStyles[this.team].logo)
                  .addField('Player Info', 'Position: ' + this.position)
                  .addBlankField();
    if (this.position === 'Defense') {
      embed.addField('Current Statistics', `Games Played: ${this.games}\nGoals: ${this.goals}\nAssists: ${this.assists}\nPoints: ${points}` +
                                                  `\nPlus/Minus: ${this.plusminus}\nPenalty Minutes: ${this.pim}\nPoints Per Game: ${ptspergame}` +
                                                  `\nHits: ${this.hits}\nShots: ${this.shots}\nShot Percentage: ${shtperc}%` +
                                                  `\nShots Blocked: ${this.shotblock}\nGame Winning Goals: ${this.gwg}` , true);
    } else {
      embed.addField("Current Statistics", `Games Played: ${this.games}\nGoals: ${this.goals}\nAssists: ${this.assists}\nPoints: ${points}` +
                                                  `\nPlus/Minus: ${this.plusminus}\nPenalty Minutes: ${this.pim}\nPoints Per Game: ${ptspergame}` +
                                                  `\nHits: ${this.hits}\nShots: ${this.shots}\nShot Percentage: ${shtperc}%` +
                                                  `\nShots Blocked: ${this.shotblock}\nFaceoff Percentage: ${faceperc}%\nGame Winning Goals: ${this.gwg}` , true);
    }
    embed.addField('\u200b', `Minutes Per Game: ${minpergame}\nHat Tricks: ${this.hattricks}\n\nPower Play Stats:\n    Goals: ${this.ppg}\n    Assists: ` +
                                                  `${this.ppa}\n    Points: ${pppoints}\n\nPenalty Kill Stats\n    Goals: ${this.pkg}\n    Assists: ${this.pka}\n    Points: ${shpoints}`,  true)
    return embed;
  }
}
