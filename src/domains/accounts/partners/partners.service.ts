import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Partner, Prisma } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { PrismaService } from 'src/db/prisma/prisma.service';
import generateRandomId from 'src/utils/generateRandomId';
import { PartnersLogInDTO, PartnersSignUpDTO } from './partners.dto';

@Injectable()
export class PartnersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(dto: PartnersSignUpDTO) {
    const { email, password, businessName, phoneNumber, staffName } = dto;
    const data: Prisma.PartnerCreateInput = {
      id: generateRandomId(),
      email,
      encryptedPassword: await hash(password, 12),
      businessName,
      phoneNumber,
      staffName,
    };
    const partner = await this.prismaService.partner.create({
      data,
      select: { id: true, email: true },
    });

    const accessToken = this.generateAccessToken(partner);

    return accessToken;
  }

  async logIn(dto: PartnersLogInDTO) {
    const { email, password } = dto;

    const partner = await this.prismaService.partner.findUnique({
      where: { email: email },
      select: { id: true, email: true, encryptedPassword: true },
    });
    if (!partner) throw new NotFoundException('No partner found');

    const isCorrectPassword = await compare(
      password,
      partner.encryptedPassword,
    );
    if (!isCorrectPassword) throw new BadRequestException('InCorrect Password');

    const accessToken = this.generateAccessToken(partner);

    return accessToken;
  }

  generateAccessToken(partner: Pick<Partner, 'id' | 'email'>) {
    const { id: subject, email } = partner;
    const secretKey = this.configService.getOrThrow<string>('JWT_SECRET_KEY');
    const accessToken = sign({ email, accountType: 'partner' }, secretKey, {
      subject,
      expiresIn: '5d',
    });

    return accessToken;
  }
}
