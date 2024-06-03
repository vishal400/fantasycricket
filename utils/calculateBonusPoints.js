module.exports.calculateBonusPoints = (player, playersData) => {
    const data = playersData.get(player);

    if(!data){
        return;
    }

    // calculate batting bonus
    const runs = data.batting_points.runs;

    if(runs >= 100){
        data.total_points += 16;
    }else if(runs >= 50){
        data.total_points += 8;
    }else if(runs >= 30){
        data.total_points += 4;
    }

    data.total_points += data.batting_points.sixCount * 2;
    data.total_points += data.batting_points.boundaryCount;

    // calculate bowling bonus
    const wicket = data.bowling_points.wicketCount;
    const bowledLBWCount = data.bowling_points.bowledLBWCount;
    const maidenOverCount = data.bowling_points.maidenOverCount;
    
    if(wicket >= 5){
        data.total_points += 16;
    }else if(wicket >= 4){
        data.total_points += 8;
    }else if(wicket >= 3){
        data.total_points += 4;
    }

    data.total_points += bowledLBWCount * 8;
    data.total_points += maidenOverCount * 12;

    // calculate fielding points
    const catchCount = data.fielding_points.catchCount;
    const stumpCount = data.fielding_points.stumpCount;
    const runOutCount = data.fielding_points.runOutCount;

    if(catchCount >= 3){
        data.total_points += 4;
    }

    data.total_points += catchCount * 8;
    data.total_points += stumpCount * 12;
    data.total_points += runOutCount * 6;

}