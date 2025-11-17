import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException('Token not found.');

        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) throw new UnauthorizedException('Server misconfiguration: missing JWT secret');

        try {
            const payload = await this.jwtService.verifyAsync(token, { secret });

            request['user'] = payload;
        } catch (err) {
            throw new UnauthorizedException('Invalid token.');
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
