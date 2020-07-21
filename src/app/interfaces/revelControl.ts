export interface IRevelControl {
  getHeight();
  getName();
  getOptions();
  getPlaylist();
  getTop();
  getType();
  getWidth();
  //getZIndex();
  // initialize(module);
  isAutoStart();
  setAutoStart(flag: boolean);
  setLeft(offset: number);
  setTop(offset: number);
  start();
  stop();
}
