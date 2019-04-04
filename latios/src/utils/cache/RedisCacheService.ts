import { RedisClient } from 'redis'
import { InterfaceCache } from './InterfaceCache'
import { Redis } from '../../datasource'
import { booleanReducer } from '../array/boolean-reducer'

export class RedisCacheService implements InterfaceCache {
    private redisClient: RedisClient = Redis.getInstance()
    private timeout: number = 30
    private cacheKeySeparator: string = '__'
    private statusOK: string = 'OK'

    public setTimeout(timeout: number): void {
        if (timeout <= 0) {
            throw Error('Expiration time can not be negative')
        }
        this.timeout = timeout
    }

    public getTimeout(): number {
        return this.timeout
    }

    public put(cacheNameSpace: string, key: string, value: string, expireInSecond: number = this.getTimeout()) {
        const self = this
        return new Promise<boolean>((resolve, reject) => {
            self.redisClient.SETEX(self.getCacheKey(cacheNameSpace, key), expireInSecond, value, (error: Error, reply: string) => {
                if (error) {
                    reject(error)
                }
                resolve(reply === this.statusOK)
            })
        })
    }

    public get(cacheNameSpace: string, key: string) {
        const self = this
        return new Promise<string>((resolve, reject) => {
            self.redisClient.get(self.getCacheKey(cacheNameSpace, key), (error: Error, reply: string) => {
                if (error) {
                    reject(error)
                }
                resolve(reply)
            })
        })
    }

    public remove(cacheNameSpace: string, key: string) {
        const self = this
        return new Promise<boolean>((resolve, reject) => {
            self.redisClient.del(self.getCacheKey(cacheNameSpace, key), (error: Error, reply: number) => {
                if (error) {
                    reject(error)
                }
                resolve(reply > 0)
            })
        })
    }

    public async clear(cacheNameSpace: string) {
        try {
            const keys: string[] = await this.findKeysInNamespace(cacheNameSpace)
            const self = this
            const deleteOperations = keys.map((key) => key.split(self.cacheKeySeparator))
                .map((cacheKeys) => this.remove(cacheKeys[0], cacheKeys[1]))
            const statuses = await Promise.all(deleteOperations)
            return statuses.reduce(booleanReducer)
        } catch (error) {
            throw Error(`Issue while clear cache in namespace ${cacheNameSpace}`)
        }
    }

    public findKeysInNamespace(cacheNameSpace: string): Promise<string[]> {
        const self = this
        return new Promise((resolve, reject) => {
            self.redisClient.keys(`${cacheNameSpace}__*`, (error: Error, reply: string[]) => {
                if (error) {
                    reject(error)
                }
                resolve(reply)
            })
        })
    }

    public getCacheKey(cacheNameSpace: string, key: string): string {
        return `${cacheNameSpace}${this.cacheKeySeparator}${key}`
    }
}