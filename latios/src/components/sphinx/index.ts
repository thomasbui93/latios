import { GeneralComponent } from '../../core/GeneralComponent'

export class Sphinx extends GeneralComponent {

    public registerControllers() {
        require('./controllers/ContentControllers.ts')
    }
}