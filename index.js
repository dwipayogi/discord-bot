require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const {
  APPLICATION_ID,
  TOKEN,
  PUBLIC_KEY,
  GUILD_ID,
  CHANNEL_ID,
  MONGODB_URI,
  MONGODB_DBNAME,
  MONGODB_COLLECTIONNAME,
} = process.env;

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

client.connect();

const database = client.db(MONGODB_DBNAME);
const collection = database.collection(MONGODB_COLLECTIONNAME);

const axios = require("axios");
const express = require("express");
const {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} = require("discord-interactions");

const app = express();

const discord_api = axios.create({
  baseURL: "https://discord.com/api/",
  timeout: 10000,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    "Access-Control-Allow-Headers": "Authorization",
    Authorization: `Bot ${TOKEN}`,
  },
});

function capitalizeFirstLetter(sentence) {
  let words = sentence.split(" ");
  for (let i = 0; i < words.length; i++) {
    let firstLetter = words[i].charAt(0).toUpperCase();
    words[i] = firstLetter + words[i].slice(1);
  }
  let result = words.join(" ");
  return result;
}

function convertDate(array) {
  let convertedDate = [];
  let data = array.split("/");
  let date = new Date(data[2], data[1] - 1, data[0]);

  let months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  let days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  let day = date.getDay();
  let month = date.getMonth();
  let year = date.getFullYear();

  let dayName = days[day];
  let monthName = months[month];
  result = `${dayName}, ${data[0]} ${monthName} ${year}`;
  convertedDate.push(result);
  return convertedDate;
}

function getDate() {
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const year = currentDate.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
}

app.post("/update", async (req, res) => {
  const allData = {
    task: [],
    deadline: [],
    time: [],
  };

  const prevData = {
    task: [],
    deadline: [],
    time: [],
  };

  const cursor = collection.find({ task: { $exists: true } });

  await cursor.forEach((data) => {
    allData.task.push(data.task);
    allData.deadline.push(data.deadline);
    allData.time.push(data.time);

    prevData.task.push(data.task);
    prevData.deadline.push(data.deadline);
    prevData.time.push(data.time);
  });

  for (let i = 0; i < allData.task.length; i++) {
    if (allData.deadline[i] < getDate()) {
      allData.task.splice(i, 1);
      allData.deadline.splice(i, 1);
      allData.time.splice(i, 1);
      i--;
    }
  }

  if (allData.task.length == 0) {
    await collection.deleteMany({ task: { $exists: true } });
  } else {
    const result = allData.task.map((task, i) => ({
      task: allData.task[i],
      deadline: allData.deadline[i],
      time: allData.time[i],
    }));
    await collection.deleteMany({ task: { $exists: true } });
    await collection.insertMany(result);
  }

  if (prevData.task.length !== allData.task.length) {
    const currentDate = new Date();

    const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
    });

    const formattedDate = dateTimeFormatter.format(currentDate);

    await collection.updateOne(
      { updatedAt: { $exists: true } },
      {
        $set: {
          updatedAt: `${formattedDate}`,
          updatedBy: `Admin`,
        },
      }
    );
  }

  return res.send("data telah diupdate");
});

app.post("/reminder", async (req, res) => {
  const allData = {
    task: [],
    deadline: [],
    time: [],
    updatedAt: "",
    updatedBy: "",
  };

  const cursor = collection.find({});

  await cursor.forEach((data) => {
    if (data.task !== undefined) {
      allData.task.push(data.task);
      allData.deadline.push(data.deadline);
      allData.time.push(data.time);
    }
    if (data.updatedAt !== undefined) {
      allData.updatedAt = data.updatedAt;
      allData.updatedBy = data.updatedBy;
    }
  });

  const fields = allData.task.map((task, index) => {
    return {
      name: task,
      value: `Deadline : ${convertDate(allData.deadline[index])} jam ${
        allData.time[index]
      }`,
    };
  });

  if (allData.task.length == 0) {
    return res.send(`tidak ada tugas yang harus dikerjakan`);
  }
  
  await discord_api.post(`/channels/${CHANNEL_ID}/messages`, {
    content: "@everyone",
    embeds: [
      {
        type: "rich",
        title: `List Tugas :`,
        description: ``,
        color: 0x0084ff,
        fields: fields,
        footer: {
          text: `terakhir diubah oleh ${allData.updatedBy} pada ${allData.updatedAt}`,
        },
      },
    ],
  });

  return res.send(`reminder sudah dikirim`);
});

app.post("/interactions", verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;
  let name = interaction.member.nick;
  if(name == null) {
    name = interaction.member.user.username;
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    if (interaction.data.name == "halo") {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              type: "rich",
              title: `Halo ${name}!`,
              description: `Ini adalah pesan balasan dari bot.`,
              color: 0x0084ff,
              fields: [
                {
                  name: `Selamat Datang!`,
                  value: `Terima kasih sudah menggunakan bot ini.`,
                },
                {
                  name: `Info Command`,
                  value: `Gunakan perintah \`/halo\` untuk info bot\nGunakan perintah \`/see\` untuk melihat tugas\nGunakan perintah \`/add\` untuk menambah tugas\nGunakan perintah \`/delete\` untuk menghapus tugas`,
                },
                {
                  name: `Notes`,
                  value: `Jika bot \"did not respond\", sebenarnya itu berhasil di sisi server.\nPastikan bahwa perintah yang dijalankan telah berhasil\n\nLink Repository : https://github.com/dwipayogi/my-discord-bot`,
                },
              ],
              footer: {
                text: `Bot by Dwipa Yogi`,
              },
            },
          ],
        },
      });
    }

    if (interaction.data.name == "add") {
      const data = {
        task: "",
        deadline: "",
        time: "",
      };

      const task2 = interaction.data.options.find(
        (option) => option.name === "tugas"
      )?.value;
      const deadline2 = interaction.data.options.find(
        (option) => option.name === "deadline"
      )?.value;
      const time2 = interaction.data.options.find(
        (option) => option.name === "waktu"
      )?.value;

      data.task = capitalizeFirstLetter(task2);
      data.deadline = deadline2;
      data.time = time2;

      res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              type: "rich",
              title: `Tambah Tugas`,
              description: `Tugas **${task2}** dengan deadline *${convertDate(
                deadline2
              )} jam ${time2}* telah ditambahkan.`,
              color: 0xff0000,
            },
          ],
        },
      });

      await collection.insertOne(data);

      const currentDate = new Date();

      const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
      });

      const formattedDate = dateTimeFormatter.format(currentDate);

      await collection.updateOne(
        { updatedAt: { $exists: true } },
        {
          $set: {
            updatedAt: `${formattedDate}`,
            updatedBy: `${name}`,
          },
        }
      );

      return;
    }

    if (interaction.data.name == "see") {
      const allData = {
        task: [],
        deadline: [],
        time: [],
        updatedAt: "",
        updatedBy: "",
      };

      const cursor = collection.find({});

      await cursor.forEach((data) => {
        if (data.task !== undefined) {
          allData.task.push(data.task);
          allData.deadline.push(data.deadline);
          allData.time.push(data.time);
        }
        if (data.updatedAt !== undefined) {
          allData.updatedAt = data.updatedAt;
          allData.updatedBy = data.updatedBy;
        }
      });

      if (allData.task.length == 0) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                type: "rich",
                title: `Turu`,
                description: `Tidak ada tugas yang harus dikerjakan`,
                color: 0x00ff2a,
                footer: {
                  text: `terakhir diubah oleh ${allData.updatedBy} pada ${allData.updatedAt}`,
                },
              },
            ],
          },
        });
      }

      const fields = allData.task.map((task, index) => {
        return {
          name: task,
          value: `Deadline : ${convertDate(allData.deadline[index])} jam ${
            allData.time[index]
          }`,
        };
      });

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              type: "rich",
              title: `List Tugas :`,
              description: ``,
              color: 0x0084ff,
              fields: fields,
              footer: {
                text: `terakhir diubah oleh ${allData.updatedBy} pada ${allData.updatedAt}`,
              },
            },
          ],
        },
      });
    }
  }

  if (interaction.data.name == "delete") {
    const deleteTask = interaction.data.options.find(
      (option) => option.name === "tugas"
    )?.value;

    const deleteQuery = {
      task: deleteTask,
    };

    if ((await collection.countDocuments(deleteQuery)) === 0) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              type: "rich",
              title: `404 Not Found`,
              description: `Tugas **${deleteTask}** tidak ditemukan.`,
              color: 0xff7700,
            },
          ],
        },
      });
    }

    await collection.deleteMany(deleteQuery);
    res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          {
            type: "rich",
            title: `Hapus Tugas`,
            description: `Tugas **${deleteTask}** telah dihapus.`,
            color: 0xff7700,
          },
        ],
      },
    });

    const currentDate = new Date();

    const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
    });

    const formattedDate = dateTimeFormatter.format(currentDate);

    await collection.updateOne(
      { updatedAt: { $exists: true } },
      {
        $set: {
          updatedAt: `${formattedDate}`,
          updatedBy: `${name}`,
        },
      }
    );

    return;
  }
});

app.get("/register_commands", async (req, res) => {
  let slash_commands = [
    {
      name: "halo",
      description: "info bot",
      options: [],
    },
    {
      name: "add",
      description: "tambahkan tugas dengan deadline",
      options: [
        {
          name: "tugas",
          description: "nama tugas",
          type: 3,
          required: true,
        },
        {
          name: "deadline",
          description: "tulis dalam format dd/mm/yyyy",
          type: 3,
          required: true,
        },
        {
          name: "waktu",
          description: "tulis dalam format hh:mm (24 jam)",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "see",
      description: "lihat tugas yang harus dikerjakan",
      options: [],
    },
    {
      name: "delete",
      description: "hapus tugas yang sudah selesai",
      options: [
        {
          name: "tugas",
          description: "nama tugas yang ingin dihapus",
          type: 3,
          required: true,
        },
      ],
    },
  ];
  try {
    let discord_response = await discord_api.put(
      `/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
      slash_commands
    );
    console.log(discord_response.data);
    return res.send("commands have been registered");
  } catch (e) {
    console.error(e.code);
    console.error(e.response?.data);
    return res.send(`${e.code} error from discord`);
  }
});

app.get("/", async (req, res) => {
  return res.send("Dwipa Yogi's Discord Bot API");
});

app.listen(8999, () => {});
