module.exports.calculateMaiderOverPoints = (overMap, playersData) => {
    overMap.forEach(over => {
        over.forEach(value => {

            // add points if total runs in an over is zero
            if(value.total_runs === 0){
                if(playersData.has(value.player)){
                    const data = playersData.get(value.player);
                    data.total_points += 12;
                    data.bowling_points.maidenOverCount++;
                }
            }
        })
    });
}