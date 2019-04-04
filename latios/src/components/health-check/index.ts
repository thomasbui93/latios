import { GeneralComponent } from '../../core/GeneralComponent'
import { Mongo, Redis } from '../../datasource'

export class HealthCheck extends GeneralComponent {
    public registerControllers() {
        require('./controllers/PingController')
    }

    public async verify(): Promise<boolean> {
        try {
            await Mongo.getConnection()
            await Redis.getInstance()
            return true
        } catch {
            return false
        }
    }
}