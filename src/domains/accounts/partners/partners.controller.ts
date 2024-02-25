import { Body, Controller, Post } from '@nestjs/common';
import { PartnersLogInDTO, PartnersSignUpDTO } from './partners.dto';
import { PartnersService } from './partners.service';

@Controller('accounts/partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post('sign-up')
  async signUp(@Body() dto: PartnersSignUpDTO) {
    const accessToken = await this.partnersService.signUp(dto);
    return { accessToken };
  }

  @Post('log-in')
  async logIn(@Body() dto: PartnersLogInDTO) {
    const accessToken = await this.partnersService.logIn(dto);
    return { accessToken };
  }
}
