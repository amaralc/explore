import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  // Returns boolean with true if the request is allowed to proceed
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorizationHeader = request.header('Authorization');
    console.log('authorizationHeader', authorizationHeader);
    return authorizationHeader === process.env['API_KEY'];
  }
}
