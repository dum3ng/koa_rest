import Router from '@koa/router'

const path = Symbol('path')
const middleware = Symbol('middleware')
// const router = Symbol('router')
export interface RouteControllerClass {
  router: Router
  getInstance(): RouteControllerClass
  new (...args: any[]): RouteControllerClass
}
declare class _Controller {}
type RouteInfo = Map<string, Map<'route' | 'method', string>>
type Method = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options'

/**
 * A Controller should be used only once, so be a singeleton.
 * @param routePrefix
 */
function Controller(routePrefix: string) {
  return function ControllerDecorator<T extends { new (...args: any[]): {} }>(
    constructor: T,
  ) {
    return class _Controller extends constructor {
      router = new Router()
      static _instance: _Controller
      static getInstance() {
        if (!_Controller._instance) {
          _Controller._instance = new _Controller()
        }
        return _Controller._instance
      }
      constructor(...args: any[]) {
        super(...args)
        this.router.prefix(routePrefix)
        const m: RouteInfo = constructor.prototype[path]
        const middlewareInfo: Map<string, any> =
          constructor.prototype[middleware]
        m?.forEach((info, property) => {
          const handler = Reflect.get(this, property)
          const [route, method]: [string, Method] = [
            info.get('route')!,
            info.get('method')! as Method,
          ]
          const middlewares = middlewareInfo?.get(property) || []
          this.router[method](route, ...middlewares, (ctx, next) =>
            handler(ctx, next),
          )
        })
      }
    }
  }
}

export { Controller }

function useMiddleware(middlewares: any[]) {
  return function middleDecorator(target: any, property: string) {
    target[middleware] = target[middleware] || new Map()
    target[middleware].set(property, middlewares)
  }
}

export { useMiddleware }

interface ControllerClass {
  router: Router
}

const methods = ['get', 'post', 'put', 'patch', 'delete', 'options']
function makeMethodDecorator(method: string) {
  function M(route: string) {
    return function MethodDecorator(
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ): any {
      target[path] = target[path] || new Map()
      target[path].set(
        propertyKey,
        new Map([
          ['route', route],
          ['method', method],
        ]),
      )
    }
  }
  return M
}

const [Get, Post, Put, Patch, Delete, Options] = methods.map((m) =>
  makeMethodDecorator(m),
)

export { Get, Post, Put, Patch, Delete, Options }
