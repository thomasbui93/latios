import 'reflect-metadata'
import { Express } from 'express'
import * as bodyParser from 'body-parser'
import cors from 'cors'
import compression from 'compression'
import { Container } from 'inversify'
import { InversifyExpressServer } from 'inversify-express-utils'
import { InterfaceComponent } from '../core/InterfaceComponent'
import { booleanReducer } from '../utils/array/booleanReducer'
import components from '../components'
import { register } from '../utils/ioc'
import { errorHanlder } from '../core/middlewares/error'

export class ApplicationBoot {
    private server: InversifyExpressServer
    private components: InterfaceComponent[]

    constructor() {
        const container = new Container()
        this.registerServices(container)
        this.registerComponents()
        this.server = new InversifyExpressServer(container)
    }

    private async verify(): Promise<boolean> {
        try {
            const verification = this.components.map((component) => component.verify())
            const componentStatuses = await Promise.all(verification)
            return componentStatuses.reduce(booleanReducer)
        } catch (exception) {
            return false
        }
    }

    public setup(): void {
        const components = this.components
        components.forEach((component) => component.boot())
        this.server.setConfig((app: Express) => {
            app.use(bodyParser.urlencoded({
                extended: true
            }))
            app.use(bodyParser.json())
            app.use(cors())
            app.use(compression({
                level: 9
            }))
            app.use(errorHanlder)
            components.forEach((component) => component.applyMiddewares(app))
        })

        this.server.build().listen(this.getPort())
    }

    public async boot(): Promise<any> {
        const isVerified = await this.verify()
        if (isVerified) {
            this.setup()
        } else {
            console.log('Failed to verify system while startup. Please check the log')
        }
    }

    public getPort(): number {
        return Number(process.env.PORT) || 8080
    }

    public registerServices(container: Container): void {
        register(container)
    }

    public registerComponents(): void {
        try {
            this.components = components
        } catch (exception) {
            console.log(exception)
        }
    }
}