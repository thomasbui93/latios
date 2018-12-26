import { HealthCheck } from './health-check'
import { Auth } from './auth'

export default [
    new HealthCheck('health-check'),
    new Auth('auth')
]