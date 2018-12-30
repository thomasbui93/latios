import { Container } from 'inversify'
import { HealthCheck } from '../../components/health-check/services/HealthCheck'
import { AuthService } from '../../components/auth/services/AuthService'
import { SphinxContentService } from '../../components/sphinx/services/SphinxContentService'

export const TYPES = {
    HealthCheck: Symbol('HealthCheck'),
    AuthService: Symbol('AuthService'),
    SphinxContentService: Symbol('SphinxContentService'),
}

export const register = (container: Container): void => {
    container.bind<HealthCheck>(TYPES.HealthCheck).to(HealthCheck)
    container.bind<AuthService>(TYPES.AuthService).to(AuthService)
    container.bind<SphinxContentService>(TYPES.SphinxContentService).to(SphinxContentService)
}