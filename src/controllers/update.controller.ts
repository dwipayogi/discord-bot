import { Request, Response } from "express";
import { collection } from "../lib/db";
import getDate from "../functions/getDate";
import { Data, DataArray } from "../types/data";

export const update = async (req: Request, res: Response) => {
  const allData: DataArray = {
    task: [],
    deadline: [],
    time: [],
  };

  const prevData: DataArray = {
    task: [],
    deadline: [],
    time: [],
  };

  const cursor = collection.find({ task: { $exists: true } });

  await cursor.forEach((data: Data) => {
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
};
