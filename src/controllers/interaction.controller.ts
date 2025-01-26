import { Request, Response } from "express";
import { collection, PUBLIC_KEY } from "../lib/db";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import capitalizeFirstLetter from "../functions/capitalize";
import convertDate from "../functions/convertDate";
import { Data, AllData, InputData } from "../types/data";

if (PUBLIC_KEY == undefined) {
  throw new Error("PUBLIC_KEY is not defined");
}

export const interaction = async (req: Request, res: Response) => {
  const interaction = req.body;
  let name = interaction.member.nick;
  if (name == null) {
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
      const data: Data = {
        task: "",
        deadline: "",
        time: "",
      };

      const task2 = interaction.data.options.find(
        (option: { name: string }) => option.name === "tugas"
      )?.value;
      const deadline2 = interaction.data.options.find(
        (option: { name: string }) => option.name === "deadline"
      )?.value;
      const time2 = interaction.data.options.find(
        (option: { name: string }) => option.name === "waktu"
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
      const allData: AllData = {
        task: [],
        deadline: [],
        time: [],
        updatedAt: "",
        updatedBy: "",
      };

      const cursor = collection.find({});

      await cursor.forEach((data: InputData) => {
        if (data.task !== undefined) {
          allData.task.push(data.task);
            allData.deadline.push(data.deadline);
            allData.time.push(data.time);
          }
          if (data.updatedAt !== undefined) {
            allData.updatedAt = data.updatedAt;
            allData.updatedBy = data.updatedBy;
          }
        }
      );

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
      (option: { name: string }) => option.name === "tugas"
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
};
