import { Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
import { RedisClient } from 'redis'
import { AuthenticatedRequest } from '../../../@types/express'
import { isRequiredAuthentiation } from '../../../utils/const/secured-routes'
import { InterfaceMiddleware } from '../../../core/InterfaceMiddleware'
import { Redis } from '../../../datasource'
import { blackedListTokens } from '../../../utils/const/redis'

export class AuthMiddleware implements InterfaceMiddleware {
    private redisClient: RedisClient

    constructor() {
        this.redisClient = Redis.getInstance()
    }

    async apply(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        if (!isRequiredAuthentiation(req.url, req.method)) {
            return next()
        }
        if (req.headers['x-token']) {
            const user = await this.verifyToken(String(req.headers['x-token']))

            if (!user) {
                res.status(403).json({
                    message: 'Unauthorized request'
                })
            }

            req.user = user
            return next()
        } else {
            res.status(403).json({
                message: 'Unauthorized request'
            })
        }
    }

    async verifyToken(token: string) {
        try {
            const isBlackedlist = await this.isTokenBlackedListToken(token)

            if (isBlackedlist) {
                false
            }

            const user = verify(token, process.env.SECRET)

            return user
        } catch (exception) {
            return false
        }
    }

    async isTokenBlackedListToken(token: string) {
        const redisClient = this.redisClient
        return new Promise((resolve, reject) => {
            redisClient.SISMEMBER(blackedListTokens, token, (err, isBlackedList) => {
                if (err) {
                    reject(err)
                }

                if (isBlackedList === 1) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    }
}