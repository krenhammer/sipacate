export type ModalViewType = 
  | 'messages' 
  | 'project' 
  | 'rules' 
  | 'settings' 
  | 'model';

export const VIEW_PARAM = 'view';
export const OPEN_PARAM = 'modal';
export const DEFAULT_VIEW: ModalViewType = 'messages'; 