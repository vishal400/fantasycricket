const { Match, Player, TeamEntry } = require("../models");
const {
    calculateMaiderOverPoints,
} = require("../utils/calculateMaidenOverPoints");
const { calculatePoints } = require("../utils/calculatePoints");
const { calculateBonusPoints } = require("../utils/calculateBonusPoints");

module.exports.addTeam = async (req, res) => {
    try {
        // get data
        const data = req.body;
        // console.log(data.players);
        const players = await Player.find({ Player: { $in: data.players } });

        if (players.length != 11) {
            return res.send({ message: "Please choose 11 unique players" });
        }
        console.log(players);

        const captain = await Player.findOne({ Player: data.captain });
        const viceCaptain = await Player.findOne({ Player: data.viceCaptain });

        // team details
        // this will hold team details like total teams involved
        var teamDetails = {
            players: new Set(),
            teamsInvolved: new Set(),
            roles: new Set(),
            captain: "",
            viceCaptain: "",
        };

        // add captain and vice captain
        if (captain) {
            teamDetails.captain = captain.id;
        }
        if (viceCaptain) {
            teamDetails.viceCaptain = viceCaptain.id;
        }

        // add details
        players.forEach((player) => {
            // add player
            teamDetails.players.add(player.id);

            // add roles
            teamDetails.roles.add(player.Role);

            // add team
            teamDetails.teamsInvolved.add(player.Team);
        });

        // console.log(teamDetails);

        // validate team
        const validated = validateTeam(teamDetails);
        // console.log(validated);
        //return res.send(validated);
        if (validated != true) {
            return res.send({ message: validated });
        }

        // console.log(players);
        // console.log(captain);
        // console.log(viceCaptain);

        // create new Team Entry
        const newTeam = new TeamEntry({
            teamName: data.teamName,
            players: Array.from(teamDetails.players),
            captain: teamDetails.captain,
            viceCaptain: teamDetails.viceCaptain,
        });

        await newTeam.save();
        console.log(newTeam);

        return res.send({ message: "Team created successfully" });
    } catch (e) {
        res.status(500).send({ message: "internal server error!" });
    }
};

module.exports.processResults = async (req, res) => {
    try {
        const balls = await Match.find({});

        /**
         * player data map will contain players data
         *
         * example:
         *  key(String)  ->   value(Object)
         *
         *  "MS Dhoni"   ->   playerObj = { batting_points: {runs: 0, sixCount: 0, boundaryCount: 0},
         *                                  bowling_points: {wicketCount: 0, bowledLBWCount: 0, maidenOverCount: 0},
         *                                  fielding_points: {catchCount: 0, stumpCount: 0, runOutCount: 0},
         *                                  total_points: 0,
         *                                  batting_team: "" };
         *
         */
        const playersData = new Map();

        /**
         * over map keeps track of total runs in a over and bowler name
         *
         * example:
         *  key(String)  ->   value(Map)
         *                     _______________________________________________________
         *  "CSK"        ->   | key(Number)  ->  value(object)
         *                    | over no      ->  {bowler, total runs in the over}}
         *
         * */
        const overMap = new Map();

        // calculate points for each ball, this will also populate players data map
        // which will contain players details such as wicket counts, six counts, etc
        // which will be used later to find bonus points
        balls.forEach((ball) => {
            calculatePoints(ball, playersData, overMap);
        });

        // calculates bonus points
        playersData.forEach((value, key) => {
            calculateBonusPoints(key, playersData);
        });

        // calculate maiden over points
        calculateMaiderOverPoints(overMap, playersData);

        // now points are calculated for each player

        // update players data in data base
        const Players = await Player.find({});
        Players.forEach(async (player) => {
            const playerName = player.Player;
            if (playersData.has(playerName)) {
                const total_points = playersData.get(playerName).total_points;
                player.points = total_points;
            }
            await player.save();
        });

        // get team entries
        const teamEntries = await TeamEntry.find({})
            .populate("players")
            .populate("captain")
            .populate("viceCaptain");

        // calculate points for teamentries
        teamEntries.forEach(async (teamEntry) => {
            const captain = teamEntry.captain.Player;
            const viceCaptain = teamEntry.viceCaptain.Player;

            teamEntry.points = 0;

            teamEntry.players.forEach((player) => {
                if (player.Player === captain) {
                    teamEntry.points += player.points ? player.points * 2 : 0;
                } else if (player.Player === viceCaptain) {
                    teamEntry.points += player.points ? player.points * 1.5 : 0;
                }else{
                    teamEntry.points += player.points ? player.points : 0;
                }
            });

            await teamEntry.save();
        });

        return res.send({ message: "Result processed" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "internal server error!" });
    }
};

module.exports.teamResult = async (req, res) => {
    try {
        const teamEntries = await TeamEntry.find({})
            .sort({ points: -1 })
            .populate("players")
            .populate("captain")
            .populate("viceCaptain");

        if (!teamEntries) {
            res.status(404).send({ message: "no teams found" });
        }

        const maxPoints = teamEntries[0].points;
        const winningTeams = [];
        const teamResults = [];

        teamEntries.forEach((teamEntry) => {
            let result = {
                teamName: teamEntry.teamName,
                pointsScored: [],
                totalPoints: teamEntry.points,
            };

            teamEntry.players.forEach((player) => {
                result.pointsScored.push({
                    player: player.Player,
                    points: player.points,
                });
            });

            if (teamEntry.points === maxPoints) {
                winningTeams.push(result);
            }
            teamResults.push(result);
        });

        res.send({ winners: winningTeams, result: teamResults });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "internal server error!" });
    }
};

function validateTeam(teamDetails) {
    // check total teams involded
    // if total teams involved is more than one, then more 10 players
    // cannot be choosen from one team
    if (teamDetails.teamsInvolved.size < 2) {
        return "Max 10 players can be choosen from one team";
    }

    // if total no of roles are not 4 then it ensures that
    // all type of players are not involved
    if (teamDetails.roles.size < 4) {
        return "Please include at least one player of each type";
    }

    if (!teamDetails.players.has(teamDetails.captain)) {
        return "Please choose captain from the list of players selected";
    }

    if (!teamDetails.players.has(teamDetails.viceCaptain)) {
        return "Please choose vice captain from the list of players selected";
    }

    return true;
}
