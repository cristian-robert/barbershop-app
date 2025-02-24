export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string | null;
  size: number;
  mimeType: string;
  alt?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
}

export interface CreateMediaAssetInput {
  name: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  alt?: string;
}

export interface UpdateMediaAssetInput extends Partial<CreateMediaAssetInput> {
  id: string;
}
