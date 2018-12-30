import { injectable } from 'inversify'
import { Model } from 'mongoose'
import { SphinxDocumentModel, InterfaceSphinxDocumentModel } from '../model/SphinxDocument'

export interface InterfaceQuery {
    [key: string]: string
}

@injectable()
export class SphinxContentService {
    private sphinxDocument: Model<InterfaceSphinxDocumentModel> = SphinxDocumentModel

    searchDocuments(query: InterfaceQuery) {
        return this.sphinxDocument.find(query)
    }
}
