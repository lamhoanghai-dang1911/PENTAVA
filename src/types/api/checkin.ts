export type CheckinRequestDTO = {
  imageUrl: string;
  fileSizeBytes?: number;
};

export type CheckinResponse = {
  message: string;
  taskProgressId: number;
  imageUrl: string;
  checkinDate: string;
};

