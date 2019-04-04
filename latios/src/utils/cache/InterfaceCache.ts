export interface InterfaceCache {
    put(cacheNameSpace: string, key: string, value: string, expireInSecond: number): Promise<boolean>
    get(cacheNameSpace: string, key: string): Promise<string>
    remove(cacheNameSpace: string, key: string): Promise<boolean>
    clear(cacheNameSpace: string): Promise<any>
}