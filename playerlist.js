let players = [];

const getAll = () => {
    return new Promise((resolve) => {
        resolve(players);
    });
};

const get = (uuid) => {
    return new Promise((resolve) => {
        for (let player of players) {
            if (player.uuid === uuid) {
                resolve(player);
                return;
            }
        }
        resolve(null);
    });
};

const add = (uuid) => {
    return new Promise((resolve) => {
        let player = {
            uuid,
            x: 0,     // posição inicial no eixo X
            y: 10.00,     // altura
            z: 0      // profundidade
        };
        players.push(player);
        resolve(true);
    });
};

const update = (uuid, newX, newY, newZ) => {
    for (let player of players) {
        if (player.uuid === uuid) {
            player.x = newX;
            player.y = newY;
            player.z = newZ;
            break;
        }
    }
};

const remove = (uuid) => {
    players = players.filter(player => player.uuid !== uuid);
};

module.exports = {
    getAll,
    get,
    add,
    update,
    remove,
};
