require("dotenv").config();
let ativo = true;
let openChar = "〈";
let closeChar = "〉";

// Core〈6〉
// TRIO 〈3〉
// DUPLA〈2〉

//➕ Criar Trio

const {
  Client,
  IntentsBitField,
  NewsChannel,
  ChannelType,
  Guild,
  GuildDefaultMessageNotifications,
  Discord,
  MessageEmbed,
  Embed,
  Collection,
  GatewayIntentBits,
} = require("discord.js");

const env = process.env;

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.GuildIntegrations,
    IntentsBitField.Flags.MessageContent,
  ],
});

async function writeLog(msg, channelId) {
  console.log("Escrevendo no canal de logs ✏️...");
  const channel = client.channels.cache.get(channelId);

  channel.send({ content: msg });
}

async function getCategoryLength(categoryId) {
  let category = await client.channels.fetch(categoryId);
  const outlineSize = category.children.cache.size;
  return outlineSize;
}

async function createChannelUnderCategory(
  guild,
  categoryId,
  userLimit,
  nameSufix
) {
  const category = guild.channels.cache.get(categoryId);
  if (category == null) {
    console.log("A categoria selecionada não existe! - [Operação Cancelada]");
    return false;
  }
  let size;
  try {
    size = await getCategoryLength(categoryId);

    let channelName = `${openChar}${size}${closeChar} ${nameSufix}`;

    let newChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildVoice,
      parent: categoryId,
      userLimit: userLimit,
    });
    return newChannel;
  } catch (error) {
    console.error("Ocorreu um erro ao criar o canal:", error);
    return false;
  }
}

async function engine(state, limit, sufix) {
  let newState = state;
  let guild = newState.guild;
  let newVoiceChannel;
  try {
    newVoiceChannel = await createChannelUnderCategory(
      newState.guild,
      newState.channel.parentId,
      limit,
      sufix
    );
    writeLog(
      `➕🔈 Canal de voz **${newVoiceChannel.name}** criado conforme solicitado por ${newState.member}`,
      env.LOG_CHANNEL
    );
    try {
      // move o usuário para o novo canal
      newState.member.voice.setChannel(newVoiceChannel);
      return true;
    } catch {
      console.log("Erro ao inserir usuário no canal criado: ", error);
      return null;
    }
  } catch {
    console.log("Erro ao criar nova sala");
    return null;
  }
}

client.on("interactionCreate", (interaction) => {
  if (interaction.isChatInputCommand()) {
    switch (interaction.commandName) {
      case "exec":
        if (
          interaction.member.roles.cache.some(
            (role) => role.id === env.BOT_MANAGER_TAG
          )
        ) {
          if (!ativo) {
            ativo = true;
            interaction.reply(
              "🟢 **O Bot do Eddie foi iniciado** - Em execução"
            );
            console.log("Execução iniciada");
          } else {
            interaction.reply("🟢 **Já em execução** - Em execução");
          }
        } else {
          interaction.reply(
            "❌ **Você não tem permissão para executar este comando** ❌"
          );
        }
        break;
      case "pause":
        if (
          interaction.member.roles.cache.some(
            (role) => role.name === "EddieBot Manager"
          )
        ) {
          if (ativo) {
            ativo = false;
            interaction.reply(
              "⚠️ **O Bot do Eddie foi parado** - Bot parado 🔴"
            );
            console.log("Bot Parado");
          } else {
            interaction.reply("🟥 **O Bot já está parado** - Bot parado");
          }
        } else {
          interaction.reply(
            "❌ **Você não tem permissão para executar este comando** ❌"
          );
        }

        break;

      case "wipe":
        if (
          interaction.member.roles.cache.some(
            (role) => role.name === "EddieBot Manager"
          )
        ) {
          interaction.channel.messages.fetch({ limit: 100 }).then((ret) => {
            ret.forEach((msg) => {
              msg.delete();
            });
            interaction.reply("🗑️ **Limpar Canal** - Executado ✅");
          });
        } else {
          interaction.reply(
            "❌ **Você não tem permissão para executar este comando** ❌"
          );
        }
        break;
      case "estado":
        if (
          interaction.member.roles.cache.some(
            (role) => role.name === "EddieBot Manager"
          )
        ) {
          if (ativo) {
            interaction.reply("**Satus atual do Bot do Eddie: ** - 🟢 Ativo");
          } else {
            interaction.reply("**Satus atual do Bot do Eddie: ** - 🟥 Parado");
          }
        } else {
          interaction.reply(
            "❌ **Você não tem permissão para executar este comando** ❌"
          );
        }
        break;
      case "ajuda":
        interaction.reply(
          "ℹ️ O **Bot do Eddie** gerencia canais para criar novas salas. Entrando em um canal, que tenha no início do seu nome o ícone ➕, você cria um canal na categoria de jogo escolhida. Quando o novo canal fica vazio, o canal é excluído permanentemente. Caso ainda tenha ficado na dúvida consulte um Moderador"
        );
        break;
      default:
        interaction.reply(
          "❌ **Você precisa de permissão para usar o Bot do Eddie** ❌"
        );
    }
  }
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (ativo) {
    switch (newState.channelId) {
      case env.WZ_SQUAD_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.WZ_SQUAD_LIMIT,
          env.WZ_SQUAD_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
      case env.WZ_TRIO_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.WZ_TRIO_LIMIT,
          env.WZ_TRIO_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
      case env.WZ_DUO_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.WZ_DUO_LIMIT,
          env.WZ_DUO_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
      case env.RS_SQUAD_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.RS_SQUAD_LIMIT,
          env.RS_SQUAD_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
      case env.RS_TRIO_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.RS_TRIO_LIMIT,
          env.RS_TRIO_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
      case env.RS_DUO_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.RS_DUO_LIMIT,
          env.RS_DUO_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
      case env.MP_CORE_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.MP_CORE_LIMIT,
          env.MP_CORE_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
      case env.MP_HARDCORE_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.MP_CORE_LIMIT,
          env.MP_CORE_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
      case env.MP_DEMOLITION_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.MP_DEMOLITIONL_IMIT,
          env.MP_DEMOLITION_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
      case env.DMZ_TRIO_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.DMZ_TRIO_LIMIT,
          env.DMZ_TRIO_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
      case env.RAID_QUAD_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.RAID_QUAD_LIMIT,
          env.RAID_QUAD_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
      case env.ZM_CLASSIC_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.ZM_CLASSIC_LIMIT,
          env.ZM_CLASSIC_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
      case env.ZM_MW3_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.ZM_MW3_LIMIT,
          env.ZM_MW3_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
      case env.COMP_MW_ID:
        console.log(`${newState.member} se conectou em ${newState.channelId}.`);
        writeLog(
          `➕ Usuário ${newState.member} solicitou a criação de uma sala em **${newState.channel.name}**`,
          env.LOG_CHANNEL
        );
        engine(
          newState,
          env.COMP_MW_LIMIT,
          env.COMP_MW_NAME +
            ` ${(await client.users.fetch(newState.member)).displayName}`
        );
        break;
    }
    try {
      if (oldState.channel) {
        let fChar = String(oldState.channel.name)[0];
        if (fChar == openChar) {
          if (oldState.channel.members.size < 1) {
            console.log("🗑️  Deletando canal vazio.");
            oldState.channel.delete();
          }
        }
      }
    } catch {
      console.log("❌ Não foi possível excluir o canal: ", error);
    }

    try {
      if (newState.channel) {
        let fChar = String(newState.channel.name)[0];
        if (fChar == openChar) {
          console.log(
            "🟠 Interação em um server passível de exclusão. Size do canal: " +
              newState.channel.members.size
          );

          if (newState.channel.members.size < 1) {
            console.log("Canal vazio");
            newState.channel.delete();
          }
        }
      }
    } catch {
      console.log("Não foi possível excluir o canal: ", error);
    }
  }
});

client.on("ready", (c) => {
  console.log(`🟢 ${c.user.tag} is online.`);
  writeLog("🟢 **Bot do Eddie inciado** - Executando", env.LOG_CHANNEL);
});

client.login(env.TOKEN);
