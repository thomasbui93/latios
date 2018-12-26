import { Request, Response } from 'express'
import { controller, httpGet, httpPost } from 'inversify-express-utils'
import { inject } from 'inversify'
import { TYPES } from '../../../utils/ioc'
import { AuthService } from '../services/AuthService'

@controller('/api/auth')
export class AuthController {

    constructor(
        @inject(TYPES.AuthService) private authService: AuthService
    ) {}

    /**
     * Register user
     * @param request Request
     * @param response Response
     */
    @httpPost('/register')
    private async register(request: Request, response: Response) {
        try {
            const user = await this.authService.register(request.body)
            response.json({
                user
            })
        } catch ( exception ) {
            console.log(exception)
            return response.json({
                error: true,
                message: 'Error has occured!'
            })
        }
    }

    /**
     * Authenticate user
     * @param request Request
     * @param response Response
     */
    @httpPost('/authenticate')
    private async authenticate(request: Request, response: Response) {
        try {
            const token = await this.authService.login(request.body.email, request.body.password)
            response.json({
                token
            })
        } catch ( exception ) {
            return response.json({
                error: true,
                message: 'Failed to authenticate user'
            })
        }
    }

    /**
     * refresh token
     * @param request Request
     * @param response Response
     */
    @httpPost('/refresh-token')
    private async refreshToken(request: Request, response: Response) {
        try {
            const token = await this.authService.refreshToken(request.body.token, request.body.refreshToken)
            response.json(token)
        } catch ( exception ) {
            return response.json({
                error: true,
                message: 'Failed to refresh token'
            })
        }
    }

    /**
     * refresh token
     * @param request Request
     * @param response Response
     */
    @httpPost('/logout')
    private async logout(request: Request, response: Response) {
        try {
            await this.authService.addTokenToBlackedList(request.body.token)
            response.json({
                message: 'Logout successfully'
            })
        } catch ( exception ) {
            return response.json({
                error: true,
                message: 'Failed to refresh token'
            })
        }
    }
}