const Discord = require("discord.js");
const TeamStanding = require("../../src/utils/TeamStanding.js");

module.exports = class LeagueStanding {
  constructor(leagueAbrev) {
    this.leagueName = leagueAbrev;
    this.conferences = [{conference: '', teamStandings: []}]; 
  }

  addTeamStanding(teamStanding){
      let conferenceFound = false;
      let conf = this.conferences.find((c, i) => {
        if (c.conference === teamStanding.conference){
            this.conferences[i].teamStandings.push(teamStanding);
            conferenceFound = true;
        }
      });

      //this should only execute if the conference was not found
      if (!conferenceFound){
        this.conferences.push({
            conference: teamStanding.conference,
            teamStandings: [teamStanding]
        });
      }
  }

  toRichEmbed() {
    let stringBuilder = '';
    this.conferences.forEach(function(x){
        if (x.conference != ''){
            stringBuilder = stringBuilder + "\n" + x.conference + ":\n"
        }
        x.teamStandings.forEach(function(y){
            if (y.team === ''){
                stringBuilder = stringBuilder + "--------------------\n";
            } else {
                stringBuilder = stringBuilder + y.po + " | " + y.team + " | " + y.points + "pts\n";
            }
        });
      });

    return new Discord.RichEmbed()
                  .setTitle(this.leagueName)
                  .setFooter('© BrewskyBoy')
                  .setTimestamp()
                  .addField(`Conference Standings`, stringBuilder, true)

  }
}