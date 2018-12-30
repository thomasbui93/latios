import { Document, Schema, Model, model } from 'mongoose'
import { hash } from 'bcrypt'

export interface InterfaceUser {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    createdAt: Date,
    updatedAt: Date
}

export interface InterfaceUserModel extends InterfaceUser, Document {}

const UserSchema: Schema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: Date,
    updatedAt: Date
})

UserSchema.pre<InterfaceUserModel>('save',  async function(next: any) {
    const now = new Date()
    if (!this.createdAt) {
      this.createdAt = now
    }
    this.updatedAt = now
    if (this.isModified('password')) {
        this.password = await hash(this.password, 10)
    }
    next()
})

UserSchema.set('toJSON', {
    transform(document: Document, ret: any, options: any) {
        delete ret['password']
        return ret
    }
})

export const UserModel: Model<InterfaceUserModel> = model<InterfaceUserModel>('user', UserSchema)