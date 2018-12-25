import { createClient, RedisClient } from 'redis'

export class Redis {
    private static client: RedisClient

    private constructor() {
    }

    public static getInstance(): RedisClient {
        if (typeof Redis.client === 'undefined') {
            Redis.client = this.getClient()
        }
        return Redis.client
    }

    private static getClient(): RedisClient {
        try {
            const host = process.env.REDIS_HOST
            const port = process.env.REDIS_PORT
            const password = process.env.REDIS_PASSWORD
            if (typeof host === 'undefined' || typeof port === 'undefined' || typeof password === 'undefined') {
                throw new Error('Please defined host and port for redis in .env file')
            }
            return createClient(`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`, {
                password: password
            })
        } catch ( exception ) {
            console.log(exception)
            throw new Error('Error while connecting redis')
        }
    }

    public static async getStatus(): Promise<boolean> {
        const status = await this.getInstance().ping()
        return status
    }
}