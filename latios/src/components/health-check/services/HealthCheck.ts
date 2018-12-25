import { injectable } from 'inversify'
import { Redis, Mongo } from '../../../datasource'

interface HealthStatus {
    [key: string]: boolean
}

@injectable()
export class HealthCheck {
    private services = [
        Redis,
        Mongo
    ]

    private serviceNames = [
        'redis',
        'mongo'
    ]

    async check(): Promise<HealthStatus> {
        const healthStatuses: HealthStatus = {}
        const serviceStatuses = this.services.map((service) => service.getStatus())
        const statuses = await Promise.all(serviceStatuses)

        this.serviceNames.forEach((serviceName, index) => {
            healthStatuses[serviceName] = statuses[index]
        })

        return healthStatuses
    }
}