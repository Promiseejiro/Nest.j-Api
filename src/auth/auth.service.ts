import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { comparePassword, hashPassword } from './utils/password';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async signUp(signUpDto: SignUpDto): Promise<User> {
        const { email, password, firstName, lastName } = signUpDto;
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new UnauthorizedException('Email already in use');
        }
        const hashedPassword = await hashPassword(password);
        return this.usersService.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
        });
    }

    async signIn(signInDto: SignInDto) {
        const { email, password } = signInDto;
        const user = await this.usersService.findByEmail(email);
        if (!user || !(await comparePassword(password, user.password))) {
            throw new UnauthorizedException('Invalid credentis');
        }
        const payload = { sub: user.id, email: user.email };
        const access_token = await this.jwtService.signAsync(payload);


        return { access_token };
    }

}