
module.exports = class Team {
  constructor(teamName) {
    this.name = teamName;
    this.games = 0;
    this.wins = 0;
    this.losses = 0;
    this.otwins = 0;
    this.otlosses = 0;
    this.sowins = 0;
    this.solosses = 0;
    this.goalsfor = 0;
    this.goalsagainst = 0;
    this.homewins = 0;
    this.homelosses = 0;
    this.homeotwins = 0;
    this.homeotlosses = 0;
    this.homesowins = 0;
    this.homesolosses = 0;
    this.shotsfor = 0;
    this.shotsagainst = 0;
    this.ppattempts = 0;
    this.ppgoals = 0;
    this.pkattempts = 0;
    this.pkgoalsGA = 0;
    this.shutouts = 0;
  }
}
