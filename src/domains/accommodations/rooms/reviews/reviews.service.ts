import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, Room, User } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createReview(
    roomId: Room['id'],
    userId: User['id'],
    dataWithoutRoomId: Prisma.ReviewCreateWithoutRoomInput,
  ) {
    const existingReview = await this.prismaService.review.findFirst({
      where: {
        roomId,
        userId,
      },
    });
    if (existingReview) {
      throw new ConflictException('User already reviewed this room.');
    }

    const data: Prisma.ReviewUncheckedCreateInput = {
      roomId,
      userId,
      ...dataWithoutRoomId,
    };
    return await this.prismaService.review.create({ data });
  }
}
