import { Body, Controller, Post } from '@nestjs/common';
import { UsersLogInDTO, UsersSignUpDTO } from './users.dto';
import { UsersService } from './users.service';

@Controller('accounts/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign-up')
  async signUp(@Body() dto: UsersSignUpDTO) {
    const accessToken = await this.usersService.signUp(dto);
    return { accessToken };
  }

  @Post('log-in')
  async logIn(@Body() dto: UsersLogInDTO) {
    const accessToken = await this.usersService.logIn(dto);
    return { accessToken };
  }
}
