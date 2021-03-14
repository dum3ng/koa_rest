import Koa from 'koa'
import { RouteControllerClass } from './controller'

export class Application {
  public app: Koa
  public port: number = 3000
  public hostname: string = '127.0.0.1'
  public controllers?: any[]
  static _instance: Application
  static get instance() {
    if (!this._instance) {
      this._instance = new this()
    }
    return this._instance
  }
  constructor() {
    this.app = new Koa()
  }

  main(): void {
    // implement me
  }

  start(appCallback?: () => {}) {
    const { port, hostname } = this

    this.app.listen(
      port,
      hostname,
      appCallback
        ? () => appCallback()
        : () => {
            console.log(`app is running on ${port}`)
          },
    )
  }

  static run() {
    this.instance.main()
  }
}

export interface IConfig {
  controllers: RouteControllerClass[]
  port?: number
  hostname?: string
}

type A = typeof Application

export function Config(config: IConfig) {
  return function ConfigDecorator(constructor: A) {
    return class _Application extends constructor {
      constructor() {
        super()

        this.port = config.port ?? this.port
        this.hostname = config.hostname ?? this.hostname
        // use the routes of controllers
        console.log(config)
        if (config.controllers) {
          config.controllers.forEach((controller) => {
            this.app.use(controller.getInstance().router.routes())
          })
        }
      }
    }
  }
}
