import { AccommodationType, Prisma } from '@prisma/client';

export type AccommodationsRegisterDTO = {
  type: AccommodationType;
  name: string;
  address1: string;
  address2: string;
  latitude: number;
  longitude: number;
  description?: string;
  imgUrl?: string;
};

export type AccommodationsAddRoomDTO =
  Prisma.RoomCreateWithoutAccommodationInput;
