import { connect, Mongoose, connection } from 'mongoose'

export class Mongo {
    private static client: Promise<Mongoose>

    private constructor() {}

    public static getInstance(): Promise<Mongoose> {
        if (typeof Mongo.client === 'undefined') {
            Mongo.client = this.getClient()
        }
        return Mongo.client
    }

    private static getClient(): Promise<Mongoose> {
        const connectionURL = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`
        try {
            return connect(connectionURL, { autoReconnect: true, useNewUrlParser: true})
        } catch (exception) {
            console.log(exception)
            throw new Error('Error while connecting mongo')
        }
    }

    public static getConnection() {
        try {
            const mongoClient = Mongo.getInstance()
            mongoClient
                .then(database => {
                    return database
                })
                .catch(err => {
                    console.log(err)
                })
            return mongoClient
        } catch (exception) {
            console.log(exception)
        }
    }

    public static getStatus(): boolean {
        return connection.readyState === 1
    }
}