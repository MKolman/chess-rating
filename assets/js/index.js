function parseScore(score) {
    if (score == 1) {
        return "1-0";
    } else if (score == 0) {
        return "0-1";
    } else {
        return "½-½";
    }
}

function loadUI() {
    loadUserTable(api.users);
    loadUserDropdowns(api.users);
    loadGameTable(api.games, api.user_by_id);
    loadChart();
}

function loadUserTable(users) {
    let table_body = $("table#user-rating tbody");
    table_body.html('');
    users.sort((a, b) => b.rating - a.rating);
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        table_body.append(`<tr><td>${user.id}</td><td>${user.name}</td><td>${user.rating}</td></tr>`);
    }
}

function loadGameTable(games, user_by_id) {
    let table_body = $("table#recent-games tbody");
    table_body.html('');
    for (let i = 0; i < games.length; i++) {
        let game = games[i];
        table_body.append(
            `<tr><td>${new Date(game.time)}</td><td>${user_by_id[game.players[0]].name}</td>
            <td>${user_by_id[game.players[1]].name}</td><td>${parseScore(game.score)}</td></tr>`);
    }
}

function loadUserDropdowns(users) {
    let select = $("select.user-dropdown");
    select.html('');
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        select.append(`<option value="${user.id}">${user.id}. ${user.name}</option>`);
    }
}

function loadCategoryDropdown() {
    let select = $("#categories");
    select.html('');
    for (let i = 0; i < categories.data.length; i++) {
        let c = categories.data[i];
        select.append(`<option value="${c.id}">${c.name}</option>`);
    }
    setTimeFormat();
}

function addNewCategory() {
    let name = prompt("You want to add another category. How do you want to name it?");
    if (name !== null && name.length > 0) {
        categories.newCategory(name, loadCategoryDropdown);
    }
}

function addNewUser() {
    let name = prompt("You want to add a new player. What is their name?");
    if (name !== null && name.length > 0) {
        api.newUser(name);
        loadUI();
        api.save();
    }
}

function addNewGame() {
    let user1_id = $("#new-game-first").val();
    let user2_id = $("#new-game-second").val();
    let score = $("#new-game-score").val();
    api.newGame(user1_id, user2_id, score);
    loadUI();
    api.save();
}

function deleteLastGame() {
    if (api.games.length <= 0) return

    let txt = "Are you sure you want to delete the last game?\n";
    txt += JSON.stringify(api.games[api.games.length-1])
    txt += "\nType 'delete' if you are certain."
    if (prompt(txt) == "delete") {
        api.deleteGame();
        loadUI();
    }
}

function setTimeFormat() {
    let id = $("#categories").val();
    api = new Api(JSON_URL + id);
    api.fetch(loadUI);
}
