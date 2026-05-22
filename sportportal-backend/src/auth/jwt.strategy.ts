// не исполбьзуется вроде
// import { Injectable,Logger, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { UsersService } from '../users/users.service';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   private readonly logger = new Logger(JwtStrategy.name); 
//   constructor(private readonly usersService: UsersService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: process.env.JWT_SECRET || 'secret',
//     });
//   }

//   async validate(payload: { sub: string; role: string }) {
//     const user = await this.usersService.findOne(payload.sub);
//     this.logger.log(`JWT payload: ${JSON.stringify(payload)}`);
//     this.logger.log(`Validated user: ${JSON.stringify(user)}`);
//     if (!user) throw new UnauthorizedException();
//     return user;
//   }
// }
