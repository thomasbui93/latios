import { injectable } from 'inversify'
import { Model } from 'mongoose'
import dayjs from 'dayjs'
import { SphinxDocumentModel, InterfaceSphinxDocumentModel, InterfaceSphinxDocument } from '../model/SphinxDocument'
import { InterfaceSort, InterfacePagination, defaultPagination, getSkip, EnumSort } from '../../../utils/crud/pagination'
import { RedisCacheService } from '../../../utils/cache/RedisCacheService'

interface InterfaceQueryParam {
    $text?: {
        $search: string
    },
    createdAt?: {
        $gte?: Date,
        $lte?: Date
    }
}

@injectable()
export class SphinxContentService {
    private sphinxDocument: Model<InterfaceSphinxDocumentModel> = SphinxDocumentModel
    private cacheService = new RedisCacheService()
    private cacheNameSpace: string = 'spinx'

    public prepareSearchField(query: {[key: string]: string}) {
        const sort = {} as InterfaceSort
        if (query.sortBy) {
            sort[query.sortBy] = query.sortType === 'ASD' ? EnumSort.ASC : EnumSort.ASC
        }
        const pagination = {
            limit: query.limit ? parseInt(query.limit) : defaultPagination.limit,
            page: query.page ? parseInt(query.page) : defaultPagination.page
        }
        const queries = {} as InterfaceQueryParam

        if (query.text) {
            queries.$text = {
                $search : query.text
            }
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
            queries,
            sort,
            pagination
        }
    }

    searchDocuments(query: {[key: string]: string}) {
        const {queries, sort, pagination} = this.prepareSearchField(query)

        return this.performanceSearch(queries, sort, pagination)
    }

    async performanceSearch(queries: InterfaceQueryParam = {}, sort: InterfaceSort = {}, pagination: InterfacePagination = defaultPagination ) {
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

            const documents = await this.sphinxDocument
                .find(queries)
                .limit(pagination.limit)
                .skip(getSkip(pagination))
                .sort(sort)
                .exec()
            await this.cacheService.put(this.cacheNameSpace, cacheKey, JSON.stringify(documents))

            return documents
        } catch (error) {
            throw Error(`Error while searching for documents, ${error.stack}`)
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
            const document = await SphinxDocumentModel.findByIdAndRemove(documentId)
            await this.cacheService.remove(this.cacheNameSpace, documentId)

            return true
        } catch (error) {
            throw Error(`Failed to remove document.${error}`)
        }
    }
}
