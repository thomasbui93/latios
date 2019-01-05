export enum RouteTypes {
    regex = 'regex',
    exact = 'exact',
    fragmentMatched = 'fragmentMatched'
}

export enum RequestMethods {
    PUT = 'PUT',
    POST = 'POST',
    GET = 'GET',
    DELETE = 'DELETE',
    ANY = 'ANY'
}

export interface InterfaceSecuredRoute {
    path: string,
    type: RouteTypes,
    method: (string| RequestMethods) | (string| RequestMethods)[]
}

export const securedRoutes: InterfaceSecuredRoute[] = [
    {
        path: '/ping',
        type: RouteTypes.fragmentMatched,
        method: RequestMethods.ANY
    },
    /**
    {
        path: '/api/sphinx',
        type: RouteTypes.fragmentMatched,
        method: RequestMethods.ANY
    },
    */
    {
        path: '/auth/me',
        type: RouteTypes.exact,
        method: RequestMethods.ANY
    }
]

export function isRequiredAuthentiation(url: string, method: string) {
    const route = getMatchedRoute(url)

    if (typeof route === 'undefined') {
        return false
    }
    if (route.method === RequestMethods.ANY) {
        return true
    }
    return route.method === method || route.method.indexOf(method) > -1
}

export function getMatchedRoute(url: string) {
    return securedRoutes.find((route: InterfaceSecuredRoute) => isSecuredRoute(url, route))
}

export function isSecuredRoute(url: string, route: InterfaceSecuredRoute): boolean {
    switch (route.type) {
        case RouteTypes.exact:
            return url === route.path
        case RouteTypes.fragmentMatched:
            return url.indexOf(route.path) > -1
        case RouteTypes.regex:
            return new RegExp(route.path).test(url)
    }
}