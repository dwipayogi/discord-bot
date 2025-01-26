import { Request, Response } from "express";
import { collection, CHANNEL_ID } from "../lib/db";
import { discord_api } from "../lib/discord";
import convertDate from "../functions/convertDate";
import { AllData, InputData } from "../types/data";

export const reminder = async (req: Request, res: Response) => {
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
};