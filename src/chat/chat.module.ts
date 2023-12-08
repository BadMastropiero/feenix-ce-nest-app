import {Module} from '@nestjs/common';
import {ChatGateway} from "src/chat/chat.gateway";
import {AuthService} from "../auth/auth.service";
import {UsersService} from "../users/users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../users/user.entity";
import {RefreshToken} from "../auth/refreshtoken.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken])],
  providers: [ChatGateway, UsersService, AuthService],
})
export class ChatModule {
}
