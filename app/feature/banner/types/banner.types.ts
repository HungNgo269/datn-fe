export enum BannerPosition {
  HOME_SLIDER = "HOME_SLIDER",
  SIDEBAR_LEFT = "SIDEBAR_LEFT",
  HEADER = "HEADER",
  HOME_POPUP = "HOME_POPUP",
  SIDEBAR_RIGHT = "SIDEBAR_RIGHT",
  FOOTER = "FOOTER",
}

export interface Banner {
  id: number;
  title: string;
  description?: string | null;
  linkUrl?: string | null;
  position: BannerPosition;
  imageUrl: string;
  startDate?: Date;
  endDate?: Date;
  order: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
