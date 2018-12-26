import { Response, NextFunction, Express } from 'express'
import { AuthenticatedRequest } from '../@types/express'

export interface InterfaceMiddleware {
    apply(req: AuthenticatedRequest, res: Response, next: NextFunction, app?: Express): void
}