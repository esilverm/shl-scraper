const Discord = require("discord.js");
const teamStyles = require("../../data/team_style.json");

module.exports = class TeamStanding {
  constructor() {
    this.conference = '';
    this.po = 0;
    this.team = '';
    this.teamstyle = '';
    this.gamesplayed = 0;
    this.wins = 0;
    this.losses = 0;
    this.otlosses = 0;
    this.points = 0;
    this.goalsfor = 0;
    this.goalsagainst = 0;
    this.goaldiff = 0;
    this.percentage = 0.0;
    this.home = '';
    this.visitor = '';
    this.last10 = '';
    this.homelast10 = '';
    this.visitorlast10 = '';
    this.streak = '';
  }

  toRichEmbed() {
    return new Discord.RichEmbed()
                  .setTitle(this.team)
                  .setColor(+teamStyles[this.teamstyle].color)
                  .setFooter('© BrewskyBoy')
                  .setTimestamp()
                  .setThumbnail(teamStyles[this.teamstyle].logo)
                  .addField('Current Team Standings', `Conference Position: ${this.po}\nGames Played: ${this.gamesplayed}\nWins: ${this.wins}\nLosses: ${this.losses}\nOvertime Losses: ${this.otlosses}`, true)
                  .addField('\u200b', `Points: ${this.points}\nPoint Percentage: ${this.percentage}\nGoals For: ${this.goalsfor}\nGoals Against: ${this.goalsagainst}\nGoal Differential: ${this.goaldiff}`, true)
                  .addField('\u200b', `Streak: ${this.streak}\nHome: ${this.home}\nVisitor: ${this.visitor}`, true)
                  .addField('\u200b', `Last 10: ${this.last10}\nHome L10: ${this.homelast10}\nVisitor L10: ${this.visitorlast10}`, true);

  }
}