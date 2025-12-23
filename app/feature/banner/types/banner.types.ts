enum BannerPosition {
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
  description: string;
  linkUrl: string;
  position: BannerPosition | string;
  imageUrl: string;
  startDate: string | Date;
  endDate: string | Date;
  order: number;
  isActive: boolean;
}
