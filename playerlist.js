// playerlist.js
// CHANGES: ADICIONADO implementação completa para 3D (x,y,z), rot_y e is_running.
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

// ADICIONADO: cria um novo jogador com valores padrão 3D
const add = (uuid) => {
    return new Promise((resolve) => {
        const newPlayer = {
            uuid: uuid,
            x: 0.0,
            y: 10.0,    // default spawn height (ajuste se quiser)
            z: 0.0,
            rot_y: 0.0,
            is_running: false
        };
        players.push(newPlayer);
        resolve(newPlayer);
    });
};

// ADICIONADO: atualiza posição/rot/estado do jogador (aceita nulls)
const update = (uuid, x = null, y = null, z = null, rot_y = null, is_running = null) => {
    return new Promise((resolve) => {
        for (let i = 0; i < players.length; i++) {
            if (players[i].uuid === uuid) {
                if (x !== null && x !== undefined) players[i].x = x;
                if (y !== null && y !== undefined) players[i].y = y;
                if (z !== null && z !== undefined) players[i].z = z;
                if (rot_y !== null && rot_y !== undefined) players[i].rot_y = rot_y;
                if (is_running !== null && is_running !== undefined) players[i].is_running = is_running;
                resolve(players[i]);
                return;
            }
        }
        resolve(null);
    });
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
