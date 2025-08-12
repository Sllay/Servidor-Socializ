// server.js
// CHANGES: versão completa com suporte 3D (x,y,z), rot_y e is_running;
//          aceita "position" ou "update_position" do cliente e re-broadcasta "update_position".
// Requisitos: npm i express ws uuid
const express = require("express");
const WebSocket = require("ws");
const { v4 } = require("uuid");
const playerlist = require("./playerlist.js");

const app = express();
const PORT = 9090;

const server = app.listen(PORT, () => {
    console.log("Servidor HTTP iniciado na porta:", PORT);
});

const wss = new WebSocket.Server({ server });

wss.on("connection", async (socket) => {
    const uuid = v4();
    await playerlist.add(uuid);
    const newPlayer = await playerlist.get(uuid);

    console.log("Novo cliente conectado, uuid:", uuid);

    // Enviar UUID e confirmação ao cliente
    socket.send(JSON.stringify({
        cmd: "joined_server",
        content: { msg: "Bem-vindo ao servidor!", uuid }
    }));

    // Enviar jogador local (dados iniciais do próprio cliente)
    socket.send(JSON.stringify({
        cmd: "spawn_local_player",
        content: { msg: "Spawning local (you) player!", player: newPlayer }
    }));

    // Notificar outros clients sobre o novo jogador
    wss.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                cmd: "spawn_new_player",
                content: { msg: "Spawning new network player!", player: newPlayer }
            }));
        }
    });

    // Enviar lista de jogadores já conectados ao novo cliente
    socket.send(JSON.stringify({
        cmd: "spawn_network_players",
        content: {
            msg: "Spawning network players!",
            players: await playerlist.getAll()
        }
    }));

    socket.on("message", (message) => {
        let data;
        try {
            data = JSON.parse(message.toString());
        } catch (err) {
            console.error("Erro ao fazer parse do JSON recebido:", err);
            return;
        }

        // Aceita tanto "position" (cliente antigo) quanto "update_position"
        if (data.cmd === "position" || data.cmd === "update_position") {
            // Valores esperados: x,y,z,rot_y,is_running (z/rot_y/is_running opcionais)
            const content = data.content || {};
            const x = ("x" in content) ? parseFloat(content.x) : 0;
            const y = ("y" in content) ? parseFloat(content.y) : 0;
            const z = ("z" in content) ? parseFloat(content.z) : 0;
            const rot_y = ("rot_y" in content) ? parseFloat(content.rot_y) : 0;
            const is_running = ("is_running" in content) ? Boolean(content.is_running) : false;

            // Atualiza playerlist (3D)
            playerlist.update(uuid, x, y, z, rot_y, is_running)
                .then((updated) => {
                    // Preparar payload para rebroadcast
                    const update = {
                        cmd: "update_position",
                        content: {
                            uuid,
                            x,
                            y,
                            z,
                            rot_y,
                            is_running
                        }
                    };

                    // DEBUG: imprimir payload enviado (útil para ver se os valores estão corretos)
                    console.log("broadcasting update_position:", update.content);

                    // Enviar a todos exceto o remetente
                    wss.clients.forEach((client) => {
                        if (client !== socket && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(update));
                        }
                    });
                })
                .catch((err) => {
                    console.error("Erro ao atualizar playerlist:", err);
                });

            return;
        }

        // Mensagens de chat (mantidas)
        if (data.cmd === "chat") {
            const chat = {
                cmd: "new_chat_message",
                content: {
                    msg: data.content.msg || ""
                }
            };

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(chat));
                }
            });
            return;
        }

        // Outras mensagens podem ser logadas para debug
        console.log("Mensagem desconhecida recebida:", data.cmd, data.content);
    });

    socket.on("close", () => {
        console.log("Cliente desconectou, uuid:", uuid);
        playerlist.remove(uuid);

        // Avisar os outros jogadores
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    cmd: "player_disconnected",
                    content: { uuid }
                }));
            }
        });
    });

    socket.on("error", (err) => {
        console.error("WebSocket error (uuid " + uuid + "):", err);
    });
});
