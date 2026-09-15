export type ReviewPathname =
  | '/task1/page5'
  | '/task2/page5'
  | '/task3/page7'
  | '/task5/page4';

export type TaskCameraRouteParams = {
  taskId?: string;
  week?: string;
  selectedItems?: string;
};

export type TaskCameraCaptureScreenProps = {
  reviewPathname: ReviewPathname;
  routeParams?: TaskCameraRouteParams;
};
