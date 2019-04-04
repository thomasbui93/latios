export enum EnumSort {
    ASC = 1,
    DESC = -1
}

export interface InterfaceSort {
    [key: string]: EnumSort
}

export interface InterfacePagination {
    limit: number,
    page: number
}

export const defaultPagination = {
    limit: 12,
    page: 1
}

export function getSkip(pagination: InterfacePagination = defaultPagination): number {
    return pagination.limit * (pagination.page - 1)
}