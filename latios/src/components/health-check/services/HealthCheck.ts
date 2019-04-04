import { injectable } from 'inversify'
import { Redis, Mongo } from '../../../datasource'

enum SystemStatuses {
    Operating = 'Operating',
    Crashing  = 'Crashing'
}

interface HealthStatus {
    [key: string]: SystemStatuses
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
        try {
            const healthStatuses: HealthStatus = {}
            const serviceStatuses = this.services.map((service) => service.getStatus())
            const statuses = await Promise.all(serviceStatuses)

            this.serviceNames.forEach((serviceName, index) => {
                healthStatuses[serviceName] = statuses[index] ? SystemStatuses['Operating'] : SystemStatuses['Crashing']
            })

            return healthStatuses
        } catch (err) {
            return {}
        }
    }
}