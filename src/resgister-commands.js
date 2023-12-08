require("dotenv").config();
const { REST, Routes } = require("discord.js");

const rest = new REST({ version: "10" }).setToken(process.env.token);

const commands = [
  {
    name: "exec",
    description: "Inicia a atuação do Bot do Eddie no servidor.",
  },
  {
    name: "pause",
    description: "Para a atuação do Bot do Eddie no servidor.",
  },
  {
    name: "wipe",
    description:
      "Limpa todas as mensagens digitadas no canal que for executado.",
  },
  {
    name: "estado",
    description: "Informa se o Bot do Eddie está Ativo ou Parado.",
  },
  {
    name: "ajuda",
    description: "Explica como o bot funciona.",
  },
  
];

async function resgiterCommands() {
  try {
    console.log("Registrando comandos...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("Comandos registrados com sucesso.");
  } catch (error) {
    console.log(`Erro ao registrar comandos: ${error}`);
  }
}

resgiterCommands();
