import { Request, Response } from 'express'
import { controller, httpPost, httpGet, httpPut, requestParam, httpDelete } from 'inversify-express-utils'
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
            const data = await this.sphinxContentService.searchDocuments(request.query)
            return response.json(data)
        } catch ( exception ) {
            return response.json({
                error: true,
                message: 'Error has occured!',
            })
        }
    }

    /**
     * content creation
     * @param request Request
     * @param response Response
     */
    @httpPost('/')
    private async createAction(request: Request, response: Response) {
        try {
            const document = await this.sphinxContentService.createDocument(request.body)
            response.json({
                document: document
            })
        } catch ( exception ) {
            return response.json({
                error: true,
                message: 'Error has occured!',
            })
        }
    }

    /**
     * content creation
     * @param request Request
     * @param response Response
     */
    @httpGet('/:id')
    private async readAction(@requestParam('id') id: string, request: Request, response: Response) {
        try {
            const document = await this.sphinxContentService.getDocument(id)
            if (!document) {
                return response.status(404).json({
                    document: undefined
                })
            }
            return response.json({
                document
            })
        } catch ( exception ) {
            return response.json({
                error: true,
                message: 'Error has occured!',
            })
        }
    }

    /**
     * content creation
     * @param request Request
     * @param response Response
     */
    @httpPut('/:id')
    private async updateAction(@requestParam('id') id: string, request: Request, response: Response) {
        try {
            const document = await this.sphinxContentService.updateDocument(id, request.body)
            if (!document) {
                return response.status(404).json({
                    document: undefined
                })
            }
            return response.json({
                document
            })
        } catch ( exception ) {
            return response.json({
                error: true,
                message: 'Error has occured!',
            })
        }
    }

    /**
     * content creation
     * @param request Request
     * @param response Response
     */
    @httpDelete('/:id')
    private async removeAction(@requestParam('id') id: string, request: Request, response: Response) {
        try {
            const document = await this.sphinxContentService.removeDocument(id)
            return response.json({
                error: false
            })
        } catch ( exception ) {
            return response.json({
                error: true,
                message: 'Error has occured!',
            })
        }
    }
}