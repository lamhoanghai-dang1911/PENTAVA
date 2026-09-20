export type CheckinRequestDTO = {
  imageUrl: string;
};

export type CheckinResponse = {
  message: string;
  taskProgressId: number;
  imageUrl: string;
  checkinDate: string;
};
