
module.exports = class Goalie {
  constructor(playerName) {
    this.name = playerName;
    this.team = '';
    this.games = 0;
    this.wins = 0;
    this.losses = 0;
    this.otlosses = 0;
    this.minutes = 0;
    this.shutouts = 0;
    this.ga = 0;
    this.sa = 0;
  }

  toRichEmbed() {
    let gaa = ((this.ga / this.minutes) * 60).toFixed(2);
    let savePerc = 1 - (this.ga / this.sa).toFixed(3);
    return new Discord.RichEmbed()
                  .setTitle(this.name)
                  .setColor(+teamStyles[this.team].color)
                  .setFooter('© esilverm')
                  .setTimestamp()
                  .setThumbnail(teamStyles[this.team].logo)
                  .addField('Player Info', 'Position: Goalie')
                  .addBlankField()
                  .addField('Current Statistics', `Games Played: ${this.games}\nWins: ${this.wins}\nLosses: ${this.losses}\nOvertime Losses: ${this.otlosses}\nShutouts: ${this.shutouts}`, true)
                  .addField('\u200b', `Goals Against: ${this.ga}\nShots Against: ${this.sa}\nGoals Against Average: ${gaa}\nSave Percentage: ${savePerc}\nTotal Minutes Played: ${this.minutes}`, true);
  }
}
