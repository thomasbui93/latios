import { Request, Response } from 'express'
import { controller, BaseHttpController, httpGet } from 'inversify-express-utils'
import { inject } from 'inversify'
import { TYPES } from '../../../utils/ioc'
import { HealthCheck } from '../services/HealthCheck'

@controller('/ping')
export class PingController {

    constructor( @inject(TYPES.HealthCheck) private healthCheck: HealthCheck ) {}

    @httpGet('/')
    private async index(req: Request, response: Response) {
        try {
            const healthStatus = await this.healthCheck.check()
            return response.json(healthStatus)
        } catch ( exception ) {
            return response.json({
                error: true,
                message: 'Error has occured!'
            })
        }
    }
}