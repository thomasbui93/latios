import { Express } from 'express'

export interface InterfaceComponent {
    verify(): boolean | Promise<boolean>
    registerControllers(): void
    getRouterNamedSpace(): string
    applyMiddewares(app: Express): void
    boot(): void
}