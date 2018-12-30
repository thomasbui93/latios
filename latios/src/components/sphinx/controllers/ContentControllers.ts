import { Request, Response } from 'express'
import { controller, httpPost, httpGet } from 'inversify-express-utils'
import { inject } from 'inversify'
import { TYPES } from '../../../utils/ioc'
import { SphinxContentService } from '../services/SphinxContentService'

@controller('/api/sphinx')
export class ContentControllers {
    constructor( @inject(TYPES.SphinxContentService) private sphinxContentService: SphinxContentService ) {}

    /**
     * content listing
     * @param request Request
     * @param response Response
     */
    @httpGet('/')
    private async listAction(request: Request, response: Response) {
        try {
            const params = request.query
            const documents = await this.sphinxContentService.searchDocuments(params)
            response.json({
                content: documents
            })
        } catch ( exception ) {
            return response.json({
                error: true,
                message: 'Error has occured!',
            })
        }
    }
}