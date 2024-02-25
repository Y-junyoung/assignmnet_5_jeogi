import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Private } from 'src/decorators/private.decorator';
import { DUser } from 'src/decorators/user.decorator';
import day from 'src/utils/day';
import { RoomAddReviewDTO } from './rooms.dto';
import { RoomsService } from './rooms.service';

@Controller('/accommodations/:accommodationId/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post(':roomId/reservations')
  @Private('user')
  makeReservation(
    @DUser() user: User,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body('date') date: string,
  ) {
    const reservation = this.roomsService.makeReservation(
      user.id,
      roomId,
      day(date).startOf('day').toDate(),
    );

    return reservation;
  }

  @Put(':roomId/reservations/:reservationId')
  @Private('partner')
  cancelReservationByPartner(
    @Param('accommodationId', ParseIntPipe) accommodationId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('reservationId') reservationId: string,
  ) {
    const canceledReservation = this.roomsService.cancelReservationByPartner(
      accommodationId,
      roomId,
      reservationId,
    );

    return canceledReservation;
  }

  @Put(':roomId/reservations/:reservationId')
  @Private('user')
  cancelReservationByUser(
    @DUser() user: User,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body('date') date: string,
  ) {
    const canceledReservation = this.roomsService.cancelReservationByUser(
      user.id,
      roomId,
      day(date).startOf('day').toDate(),
    );

    return canceledReservation;
  }

  @Put(':roomId/reservations/:reservationId')
  @Private('partner')
  checkedInRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body('date') date: string,
  ) {
    const reservation = this.roomsService.checkedInRoom(
      roomId,
      day(date).startOf('day').toDate(),
    );
    return reservation;
  }

  @Post(':roomId/reviews')
  @Private('user')
  addReview(
    @Param('roomId', ParseIntPipe) roomId: number,
    @DUser() user: User,
    @Body() dto: RoomAddReviewDTO,
  ) {
    const review = this.roomsService.reviewOfTheRoom(roomId, user.id, dto);

    return review;
  }
}
