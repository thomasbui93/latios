import { Express } from 'express'
import { GeneralComponent } from '../../core/GeneralComponent'
import { AuthMiddleware } from './middlewares/AuthMiddleware'

export class Auth extends GeneralComponent {

    public registerControllers() {
        require('./controllers/AuthControllers')
    }

    public applyMiddewares(app: Express) {
        const authMiddleware = new AuthMiddleware()
        app.use(authMiddleware.apply.bind(authMiddleware))
    }
}