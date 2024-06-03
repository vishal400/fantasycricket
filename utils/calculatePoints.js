module.exports.calculatePoints = (ball, playersData, overMap) => {
    calculateBatterPoints(ball, playersData);
    calculateBowlerPoints(ball, playersData);
    calculateFielderPoints(ball, playersData);

    handleOverMap(ball, overMap);
};

function handleOverMap(ball, overMap) {
    let over = { player: ball.bowler, total_run: 0 };

    if (overMap.has(ball.BattingTeam)) {
        if (overMap.get(ball.BattingTeam).has(ball.overs)) {
            over = overMap.get(ball.BattingTeam).get(ball.overs);
        } else {
            overMap.get(ball.BattingTeam).set(ball.overs, over);
        }
    } else {
        let m = new Map();
        m.set(ball.overs, over);
        overMap.set(ball.BattingTeam, m);
    }

    over.total_run += ball.total_run;

    // calculate maiden over counts
    if(ball.ballnumber === 6){
        // const playerObj = playersData.get(over.player);
        if(over.total_run === 0){
            // if(ball.overs === 1 && ball.ballnumber === 6){
            //     console.log(ball.BattingTeam + " second");
            // }
            playerObj.bowling_points.maidenOverCount++;
        }
    }

}

function calculateFielderPoints(ball, playersData) {
    const player = ball.fielders_involved;
    const kind = ball.kind;
    let playerObj;

    if (playersData.has(player)) {
        playerObj = playersData.get(player);
    } else {
        playerObj = createPlayerObject();
        playerObj.batting_team = ball.BattingTeam;
    }

    if (kind === "caught") {
        playerObj.fielding_points.catchCount++;
        playerObj.total_points += 8;
    }

    if (kind === "stump") {
        playerObj.fielding_points.stumpCount++;
        playerObj.total_points += 12;
    }

    if (kind === "run out") {
        playerObj.fielding_points.runOutCount++;
        playerObj.total_points += 6;
    }

    if (!playersData.has(player)) playersData.set(player, playerObj);
}

function calculateBowlerPoints(ball, playersData) {
    const player = ball.bowler;
    let playerObj;

    if (playersData.has(player)) {
        playerObj = playersData.get(player);
    } else {
        playerObj = createPlayerObject();
        playerObj.batting_team = ball.BattingTeam;
    }

    if (ball.isWicketDelivery === 1) {
        let kind = ball.kind;
        playerObj.bowling_points.wicketCount++;
        if (kind !== "run out") playerObj.total_points += 25;

        if (kind === "caught and bowled" || kind === "lbw") {
            playerObj.bowling_points.bowledLBWCount++;
        }
    }

    if (!playersData.has(player)) playersData.set(player, playerObj);
}

function calculateBatterPoints(ball, playersData) {
    const player = ball.batter;
    let playerObj;

    if (playersData.has(player)) {
        // console.log("found");
        playerObj = playersData.get(player);
    } else {
        playerObj = createPlayerObject();
        playerObj.batting_team = ball.BattingTeam;
    }

    // console.log(playerObj);

    if (ball.batsman_run !== 0) {
        let run = ball.batsman_run;
        playerObj.batting_points.runs += run;
        playerObj.total_points++;

        if (run == 6) {
            playerObj.batting_points.sixCount++;
        }

        if (run == 4) {
            playerObj.batting_points.boundaryCount++;
        }
    }

    if (!playersData.has(player)) playersData.set(player, playerObj);
}

function createPlayerObject() {
    playerObj = {
        batting_points: {
            runs: 0,
            sixCount: 0,
            boundaryCount: 0,
        },
        bowling_points: {
            wicketCount: 0,
            bowledLBWCount: 0,
            maidenOverCount: 0,
        },
        fielding_points: {
            catchCount: 0,
            stumpCount: 0,
            runOutCount: 0,
        },
        total_points: 0,
        batting_team: ""
    };

    return playerObj;
}
