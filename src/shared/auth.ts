// src/auth/basic-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class BasicAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            throw new UnauthorizedException('Authorization header is missing or invalid');
        }

        const base64Credentials = authHeader.split(' ')[1];
        const [username, password] = Buffer.from(base64Credentials, 'base64').toString('ascii').split(':');

        if (username === 'admin' && password === 'password') {
            return true;
        }

        throw new UnauthorizedException('Invalid credentials');
    }
}
