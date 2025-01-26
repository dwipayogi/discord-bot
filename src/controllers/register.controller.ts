import { Request, Response } from "express";

import { discord_api } from "../lib/discord";
import { APPLICATION_ID, GUILD_ID } from "../lib/db";

export const register = async (req: Request, res: Response) => {
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
  } catch (e: any) {
    console.error(e.code);
    console.error(e.response?.data);
    return res.send(`${e.code} error from discord`);
  }
};