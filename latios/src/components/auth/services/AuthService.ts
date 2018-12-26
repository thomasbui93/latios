import { injectable } from 'inversify'
import { sign, decode } from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { compare } from 'bcrypt'
import { InterfaceUser, UserModel, InterfaceUserModel } from '../model/User'
import { Redis } from '../../../datasource'
import { tokenPair, blackedListTokens } from '../../../utils/const/redis'

interface Token {
    token: string,
    refreshToken: string
}

@injectable()
export class AuthService {
    private redisClient = Redis.getInstance()

    /**
     * create user
     * @param userData
     */
    async register(userData: InterfaceUser): Promise<InterfaceUserModel> {
        try {
            const user = await UserModel.create(userData)
            return user
        } catch (error) {
            throw Error(`Failed to create user.${error}`)
        }
    }

    /**
     * Login to retrive tokens
     * @param email string
     * @param password string
     */
    async login(email: string, password: string): Promise<Token> {
        try {
            const user = await this.authenticate(email, password)

            if (!user) {
                throw Error('Failed to authenticate user')
            }

            const refreshToken = await this.getRefreshToken()
            const token = await this.getToken(user)
            await this.registerTokenPair(token, refreshToken)
            return {
                token,
                refreshToken
            }
        } catch (error) {
            throw Error(`Failed to authenticate user.`)
        }
    }

    /**
     * Authenticate email and password
     * @param email string
     * @param password string
     */
    async authenticate(email: string, password: string): Promise<InterfaceUserModel> {
        try {
            const user = await UserModel.findOne({email: email})
            if (!user) {
                throw Error('User not found.')
            }

            const isAuthenticated = await this.comparePassword(password, user.password)

            if (!isAuthenticated) {
                throw Error('Unauthenticated user')
            }

            return user
        } catch (error) {
            throw Error('Failed to authenticate user')
        }
    }

    /**
     * compare hashed password
     * @param password string
     * @param hashedPassword string
     */
    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        try {
            const isTheSame = await compare(password, hashedPassword)

            return isTheSame
        } catch (error) {
            return false
        }
    }

    /**
     * generate token based on user data
     * @param user Partial<InterfaceUser>
     */
    public getToken(user: Partial<InterfaceUser>): Promise<string> {
        return new Promise((resolve, reject) => {
            sign({
                email: user.email
            }, process.env.SECRET, {
                expiresIn: 86400
            }, (error, token) => {
                if (error) {
                    reject(error)
                }
                resolve(token)
            })
        })
    }

    /**
     * generate refreshed token
     */
    async getRefreshToken(): Promise<string> {
        try {
            const buffer = await randomBytes(48)
            return buffer.toString('hex')
        } catch (exception) {
            throw Error('Error while generate refresh token')
        }
    }

    /**
     * register pair token and refresh token
     * @param token string
     * @param refreshToken string
     */
    async registerTokenPair(token: string, refreshToken: string) {
        const redisClient = this.redisClient
        return new Promise((resolve, reject) => {
            redisClient.hset(tokenPair, refreshToken, token, (err, status) => {
                if (err) {
                    reject(err)
                }
                resolve(status)
            })
        })
    }

    /**
     * Refresh token
     * @param token string
     * @param refreshToken string
     */
    async refreshToken(token: string, refreshToken: string) {
        const isVerified = await this.isVerifiedRefreshToken(token, refreshToken)
        if (!isVerified) {
            throw Error('Invalid refreshed tokens')
        }
        const user = decode(token)
        if (typeof user !== 'object' || typeof user.email === 'undefined') {
            throw Error('Invalid auth token')
        }
        const issuedToken = await this.getToken({
            email: user.email
        })
        const issuedRefreshedToken = await this.getRefreshToken()
        return {
            token: issuedToken,
            refreshToken: issuedRefreshedToken
        }
    }

    async isVerifiedRefreshToken(token: string, refreshToken: string) {
        const associatedToken = await this.getAssociatedToken(refreshToken)
        if (associatedToken === token) {
            return true
        } else {
            throw Error('Unmatched refresh token.')
        }
    }

    async getAssociatedToken(refreshToken: string) {
        const redisClient = this.redisClient
        return new Promise((resolve, reject) => {
            redisClient.hget(tokenPair, refreshToken, (err, token) => {
                if (err) {
                    reject(err)
                }
                resolve(token)
            })
        })
    }

    async addTokenToBlackedList(token: string) {
        const redisClient = this.redisClient
        return new Promise((resolve, reject) => {
            redisClient.sadd(blackedListTokens, token, (err, isDone) => {
                if (err) {
                    reject(err)
                }
                if (isDone >= 1) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    }
}