import { Document, Schema, Model, model } from 'mongoose'

export enum SphinxLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED'
}

export interface InterfaceSphinxDocument {
    question: string,
    answer: string,
    keywords: string[],
    level: string,
    categories: string[],
    createdAt: Date,
    updatedAt: Date
}

export interface InterfaceSphinxDocumentModel extends InterfaceSphinxDocument, Document {}

const SphinxDocumentSchema: Schema = new Schema({
    question: {
        type: String,
        required: true,
        unique: true,
        text: true,
    },
    answer: {
        type: String,
        required: true,
        text: true,
    },
    keywords: {
        type: [String],
        default: [],
    },
    level: {
        type: String,
        required: true,
        default: SphinxLevel.BEGINNER,
        enum: [SphinxLevel.BEGINNER, SphinxLevel.INTERMEDIATE, SphinxLevel.ADVANCED]
    },
    categories: {
        type: String,
        default: 'Misc',
    },
    createdAt: Date,
    updatedAt: Date
})

SphinxDocumentSchema.pre<InterfaceSphinxDocumentModel>('save', function(next: any) {
    const now = new Date()
    if (!this.createdAt) {
      this.createdAt = now
    }
    this.updatedAt = now
    next()
})

export const SphinxDocumentModel: Model<InterfaceSphinxDocumentModel> = model<InterfaceSphinxDocumentModel>('sphinx_document', SphinxDocumentSchema)