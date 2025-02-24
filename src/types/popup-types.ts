export interface Popup {
  id: string;
  title: string;
  content: string;
  type: PopupType;
  active: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  delay: number;
  frequency: PopupFrequency;
  position?: PopupPosition | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum PopupType {
  MODAL = "MODAL",
  TOAST = "TOAST",
  BANNER = "BANNER",
}

export enum PopupFrequency {
  ONCE = "ONCE",
  ONCE_PER_SESSION = "ONCE_PER_SESSION",
  EVERY_VISIT = "EVERY_VISIT",
  CUSTOM = "CUSTOM",
}

export enum PopupPosition {
  TOP = "TOP",
  TOP_LEFT = "TOP_LEFT",
  TOP_RIGHT = "TOP_RIGHT",
  BOTTOM = "BOTTOM",
  BOTTOM_LEFT = "BOTTOM_LEFT",
  BOTTOM_RIGHT = "BOTTOM_RIGHT",
  CENTER = "CENTER",
}

export interface CreatePopupInput {
  title: string;
  content: string;
  type: PopupType;
  active?: boolean;
  startDate?: Date;
  endDate?: Date;
  delay?: number;
  frequency?: PopupFrequency;
  position?: PopupPosition;
}

export interface UpdatePopupInput extends Partial<CreatePopupInput> {
  id: string;
}
