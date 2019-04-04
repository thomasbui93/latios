import { HealthCheck } from './health-check'
import { Auth } from './auth'
import { Sphinx } from './sphinx'

export default [
    new HealthCheck('health-check'),
    new Auth('auth'),
    new Sphinx('sphinx'),
]