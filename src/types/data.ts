export type Data = {
  task: string;
  deadline: string;
  time: string;
};

export type DataArray = {
  task: string[];
  deadline: string[];
  time: string[];
};

export type AllData = {
  task: string[];
  deadline: string[];
  time: string[];
  updatedAt: string;
  updatedBy: string;
};

export type InputData = {
  task: string;
  deadline: string;
  time: string;
  updatedAt: string;
  updatedBy: string;
};
