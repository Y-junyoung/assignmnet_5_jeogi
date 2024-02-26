import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Accommodation, Prisma, Reservation, Room, User } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { ReviewsService } from './reviews/reviews.service';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reviewsService: ReviewsService,
  ) {}

  async createRoom(
    accommodationId: Accommodation['id'],
    dataWithoutAccommodationId: Prisma.RoomCreateWithoutAccommodationInput,
  ) {
    const data: Prisma.RoomUncheckedCreateInput = {
      accommodationId,
      ...dataWithoutAccommodationId,
    };
    return await this.prismaService.room.create({ data });
  }

  async deleteRoom(roomId: Room['id']) {
    return await this.prismaService.room.delete({ where: { id: roomId } });
  }

  async makeReservation(
    reservedById: Reservation['reservedById'],
    roomId: Reservation['roomId'],
    date: Reservation['date'],
  ) {
    const reservation = await this.prismaService.reservation.update({
      where: { roomId_date: { roomId, date } },
      data: { reservedAt: new Date(), reservedById },
    });
    return reservation;
  }

  async cancelReservationByPartner(
    accommodationId: Room['accommodationId'],
    roomId: Room['id'],
    reservationId: Reservation['id'],
  ) {
    const room = await this.prismaService.room.findFirst({
      where: { id: roomId, accommodationId },
    });
    if (!room) throw new NotFoundException('Room not found.');

    const canceledReservation = await this.prismaService.reservation.update({
      where: { id: reservationId },
      data: { reservedAt: null, reservedById: null },
    });

    return canceledReservation;
  }

  async checkedInRoom(
    roomId: Reservation['roomId'],
    date: Reservation['date'],
  ) {
    const reservation = await this.prismaService.reservation.update({
      where: { roomId_date: { roomId, date } },
      data: { checkedInAt: new Date() },
    });
    return reservation;
  }

  async reviewOfTheRoom(
    roomId: Room['id'],
    userId: User['id'],
    data: Parameters<typeof this.reviewsService.createReview>[2],
  ) {
    const room = await this.prismaService.room.findUnique({
      where: { id: roomId },
      include: { reservations: true },
    });
    if (!room) throw new ForbiddenException();

    const reservation = room.reservations.find(
      (reservation) => reservation.reservedById === userId,
    );
    if (!reservation || !reservation.checkedInAt)
      throw new ForbiddenException('User is not checked in to this room.');

    const review = await this.reviewsService.createReview(roomId, userId, data);

    return review;
  }

  async canceledByUser(
    roomId: Room['id'],
    userId: User['id'],
    date: Reservation['date'],
  ) {
    const canceledReservation = await this.prismaService.reservation.update({
      where: { roomId_date: { roomId, date }, reservedById: userId },
      data: { reservedAt: null, reservedById: null },
    });
    return canceledReservation;
  }
}
