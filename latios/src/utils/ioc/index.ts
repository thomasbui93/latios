import { Container } from 'inversify'
import { HealthCheck } from '../../components/health-check/services/HealthCheck'

export const TYPES = {
    HealthCheck: Symbol('HealthCheck')
}

export const register = (container: Container): void => {
    container.bind<HealthCheck>(TYPES.HealthCheck).to(HealthCheck)
}