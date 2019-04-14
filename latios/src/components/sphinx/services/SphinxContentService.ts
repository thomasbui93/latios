import { injectable } from 'inversify'
import { Model } from 'mongoose'
import dayjs from 'dayjs'
import { SphinxDocumentModel, InterfaceSphinxDocumentModel, InterfaceSphinxDocument } from '../model/SphinxDocument'
import { InterfaceSort, InterfacePagination, defaultPagination, getSkip, EnumSort } from '../../../utils/crud/pagination'
import { RedisCacheService } from '../../../utils/cache/RedisCacheService'

interface InterfaceQueryParam {
    $text?: {
        $search: string,
        $language?: string
    },
    createdAt?: {
        $gte?: Date,
        $lte?: Date
    },
    level?: string,
    keywords?: string[] | string
}

@injectable()
export class SphinxContentService {
    private sphinxDocument: Model<InterfaceSphinxDocumentModel> = SphinxDocumentModel
    private cacheService = new RedisCacheService()
    private cacheNameSpace: string = 'spinx'

    public prepareSearchField(query: { [key: string]: string }) {

        const pagination = {
            limit: query.limit ? parseInt(query.limit) : defaultPagination.limit,
            page: query.page ? parseInt(query.page) : defaultPagination.page
        }
        const queries = {} as InterfaceQueryParam

        if (query.text) {
            queries.$text = {
                $search: query.text
            }
        }
        const sort = {} as InterfaceSort

        if (query.sortBy) {
            sort[query.sortBy] = query.sortType === 'ASC' ? EnumSort.ASC : EnumSort.ASC
        } else {
            sort['textScore'] = EnumSort.ASC
        }

        try {
            if (typeof query.date === 'string') {
                const dates = query.date.split('_')
                const start = dates[0] ? dayjs(dates[0]).toDate() : undefined
                const end = dates[1] ? dayjs(dates[1]).toDate() : undefined
                queries.createdAt = {
                    $gte: start,
                    $lte: end
                }
            }
        } catch (err) {
            console.log('Invalid date')
        }

        return {
            queries: {
                ...queries,
                ...{
                    level: query.level,
                    keywords: query.keywords
                }
            },
            sort,
            pagination
        }
    }

    searchDocuments(query: { [key: string]: string }) {
        const { queries, sort, pagination } = this.prepareSearchField(query)
        return this.performanceSearch(queries, sort, pagination)
    }

    async performanceSearch(queries: InterfaceQueryParam = {}, sort: InterfaceSort = {}, pagination: InterfacePagination = defaultPagination) {
        try {
            const cacheKey = JSON.stringify({
                queries,
                sort,
                pagination
            })
            const cached = await this.getDataFromCache(cacheKey)
            if (cached) {
                return JSON.parse(cached)
            }
            const documents = await this.getExecution(queries)
                .limit(pagination.limit)
                .skip(getSkip(pagination))
                .sort(sort)
                .exec()
            const meta = await this.getMetaSearchData(queries, pagination)
            const data = {
                documents,
                meta
            }
            await this.cacheService.put(this.cacheNameSpace, cacheKey, JSON.stringify(data))

            return data
        } catch (error) {
            console.log(error)
            throw Error(`Error while searching for documents, ${error.stack}`)
        }
    }

    public getExecution(queries: InterfaceQueryParam) {
        const { $text, level, keywords, createdAt } = queries
        const conditions = []
        if (level) {
            conditions.push({
                level
            })
        }
        if ($text) {
            conditions.push({
                $text
            })
        }
        if (createdAt) {
            conditions.push({
                createdAt
            })
        }
        if (keywords) {
            const keywordsCondition = typeof keywords === 'string' ? keywords.split(',') : [...keywords]
            conditions.push({
                keywords: {
                    $in: keywordsCondition
                }
            })
        }
        if (conditions.length === 0) {
            return this.sphinxDocument.find({})
        }
        const query = {
            $and: conditions
        }
        if ($text) {
            return this.sphinxDocument
                .find(query, {
                    score: {
                        $meta: 'textScore'
                    }
                })
        } else {
            return this.sphinxDocument
                .find(query)
        }
    }

    public async getMetaSearchData(queries: InterfaceQueryParam, pagination: InterfacePagination) {
        const total = await this.getExecution(queries).countDocuments()

        return {
            total,
            ...pagination
        }
    }

    public getDataFromCache(key: string) {
        return this.cacheService.get(this.cacheNameSpace, key)
    }

    async createDocument(documentData: InterfaceSphinxDocument): Promise<InterfaceSphinxDocument> {
        try {
            const document = await SphinxDocumentModel.create(documentData)

            return document
        } catch (error) {
            console.log(error)
            throw Error(`Failed to create document.${error}`)
        }
    }

    async getDocument(documentId: string): Promise<InterfaceSphinxDocument> {
        try {
            const cached = await this.getDataFromCache(documentId)
            if (cached) {
                return JSON.parse(cached)
            }

            const document = await SphinxDocumentModel.findOneAndRemove(documentId)
            await this.cacheService.put(this.cacheNameSpace, documentId, JSON.stringify(document))

            return document
        } catch (error) {
            throw Error(`Failed to get document.${error}`)
        }
    }

    async updateDocument(documentId: string, documentData: InterfaceSphinxDocument): Promise<InterfaceSphinxDocument> {
        try {
            const document = await SphinxDocumentModel.findOneAndUpdate(documentId, documentData)
            await this.cacheService.put(this.cacheNameSpace, documentId, JSON.stringify(document))

            return document
        } catch (error) {
            throw Error(`Failed to update document.${error}`)
        }
    }

    async removeDocument(documentId: string): Promise<boolean> {
        try {
            await SphinxDocumentModel.findByIdAndRemove(documentId)
            await this.cacheService.remove(this.cacheNameSpace, documentId)

            return true
        } catch (error) {
            throw Error(`Failed to remove document.${error}`)
        }
    }
}
