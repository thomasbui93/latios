export interface InterfaceComponent {
    verify(): boolean | Promise<boolean>
    registerControllers(): void
    getRouterNamedSpace(): string
    boot(): void
}