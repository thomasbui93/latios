import { InterfaceComponent } from './InterfaceComponent'
import { Express } from 'express'

export class GeneralComponent implements InterfaceComponent {
    private name: string

    constructor(name: string) {
        this.name = name
    }

    public async verify() {
        return true
    }

    public registerControllers() {
        console.log(`No controllers found in ${this.name} module`)
    }

    public getRouterNamedSpace() {
        return ''
    }

    public boot(): void {
        this.registerControllers()
    }

    public applyMiddewares(app: Express): void {}
}