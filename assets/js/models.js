const ELO_K = 32;  // The rate of change for ELO raitngs
const ELO_MEAN = 800;  // The average ELO rating
const DEFAULT_ID = 'k0n71';
const URL = 'https://api.myjson.com/bins/';

function getDiffRating(old_rating, oponent_rating, score) {
    /** Calculates the change in ELO ratings.
    params:
        old_rating (float): players current ELO rating
        opponent_rating (float): ELO rating of the opponent
        score (float): the score achieved by player
    returns (float):
        the change in player's ELO rating
        Note: the opponents ELO rating changes for the negative of this
    */
    let expected_score = 1 / (1 + 10**((oponent_rating-old_rating)/400));
    return Math.round(ELO_K * (score - expected_score));
}


function User(name, rating=ELO_MEAN, id=null) {
    if (!new.target) {
        return new User(name, rating, id);
    }

    this.name = name;
    this.rating = rating;
    this.id = id;
}

function Game(players, score, old_ratings, new_ratings=null, time=null, id=null) {
    if (!new.target) {
        return new Game(players, score, old_ratings, new_ratings, time);
    }

    this.id = id;
    this.players = players;
    this.score = score;
    this.old_ratings = old_ratings;

    if (new_ratings === null) {
        let diff_rating = getDiffRating(old_ratings[0], old_ratings[1], score);
        new_ratings = [old_ratings[0]+diff, old_ratings[1]-diff];
      }
      this.new_ratings = new_ratings;

    if (time === null) {
        time = (new Date()).getTime();
    }
    this.time = time;
}

function Api(uri) {
    if (!new.target) {
        return new Api(uri);
    }

    // Maping
    self = this;

    // What is the json url?
    self.uri = uri;

    // Was the data already fetched?
    self.fetched = false;

    // Save all users
    self.users = [];
    self.user_by_id = {};
    self.max_user_id = 0;

    // Save all games
    self.games = [];
    self.game_by_id = {};
    self.max_game_id = 0;

    self.fetch = function(callback) {
        $.ajax({
            url: self.uri,
            dataType: 'json',
            success: function(json_data){
                // Parse users
                self.users = [];
                self.user_by_id = {};
                for (let i = 0; i < json_data.users.length; i++) {
                    let u = json_data.users[i];
                    let user = new User(u.name, u.rating, u.id);
                    self.users.push(user);
                    self.user_by_id[u.id] = user;
                    self.max_user_id = Math.max(self.max_user_id, u.id);
                }

                // Parse games
                self.games = [];
                self.game_by_id = {};
                for (let i = 0; i < json_data.games.length; i++) {
                    let g = json_data.games[i];
                    let game = new Game(g.players, g.score, g.old_ratings,
                                        g.new_ratings, g.time, g.id);
                    self.games.push(game);
                    self.game_by_id[g.id] = game;
                    self.max_game_id = Math.max(self.max_game_id, g.id);
                }
                self.fetched = true;
                if (callback) callback();
            }
        })
    };

    self.save = function() {
        if (!self.fetched) {
            alert('Cannot save. Data was not fetched.');
            return;
        }
        let data = {users: self.users, games: self.games};
        $.ajax({
            url: self.uri,
            data: JSON.stringify(data),
            type:"PUT",
            contentType:"application/json; charset=utf-8",
        });
    }

    self.newUser = function(name) {
        if (!self.fetched) {
            alert('Cannot create new user. Data was not fetched.');
            return;
        }
        self.max_user_id++;
        let new_user = new User(name, ELO_MEAN, self.max_user_id);
        self.users.push(new_user);
        self.user_by_id[self.max_user_id] = new_user;
    }
    self.newGame = function(user1_id, user2_id, score) {
        if (!self.fetched) {
            alert('Cannot create new game. Data was not fetched.');
            return;
        }
        let user1 = self.user_by_id[user1_id];
        let user2 = self.user_by_id[user2_id];
        let diff_rating = getDiffRating(user1.rating, user2.rating, score);
        self.max_game_id++;
        let new_game = new Game(
            [user1_id, user2_id], score, [user1.rating, user2.rating],
            [user1.rating + diff_rating, user2.rating - diff_rating],
            (new Date()).getTime(), self.max_game_id);

        user1.rating += diff_rating;
        user2.rating -= diff_rating;

        self.games.push(new_game);
        self.game_by_id[self.max_game_id] = new_game;
    }
    self.deleteGame = function() {
        let game = self.games.pop();
        self.user_by_id[game.players[0]].rating = game.old_ratings[0];
        self.user_by_id[game.players[1]].rating = game.old_ratings[1];
        self.game_by_id[game.id] = undefined;
    }
}
