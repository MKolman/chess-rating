MY_CHART = null;

function loadChart(use_time=true) {
    if ($("#elo-chart").length == 0) {
        return;
    }
    if (MY_CHART !== null) {
        MY_CHART.destroy();
    }
    let ctx = $("#elo-chart")[0].getContext('2d');
    MY_CHART = new Chart(ctx, {
        type: "line",
        data: {
            datasets: gatherData(api, use_time)
        },
        options: {
            scales: {
                xAxes: [{
                    type: use_time ? 'time' : 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: use_time ? 'Time' : 'Game #'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'ELO rating'
                    }
                }]
            }
        }
    });
}

function gatherData(api, use_time) {
    /* Gathers data from api and returns a chartable dataset
    * returns:
    * [{}, {}, {}]
    */
    let colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
                  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
    let datasets = {};
    for (let i = 0; i < api.users.length; i++) {
        let u = api.users[i];
        datasets[u.id] = {
            label: u.name,
            borderColor: colors[i],
            steppedLine: true,
            fill: false,
            data:[]};
    }
    for (let i = 0; i < api.games.length; i++) {
        let g = api.games[i];
        datasets[g.players[0]].data.push({x: use_time ? new Date(g.time) : i, y: g.old_ratings[0]});
        datasets[g.players[0]].data.push({x: use_time ? new Date(g.time) : i, y: g.new_ratings[0]});
        datasets[g.players[1]].data.push({x: use_time ? new Date(g.time) : i, y: g.old_ratings[1]});
        datasets[g.players[1]].data.push({x: use_time ? new Date(g.time) : i, y: g.new_ratings[1]});
    }

    return Object.values(datasets);
}
