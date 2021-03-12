import { Controller, useMiddleware, Get } from '../../src/controller'
import { Application, Config } from '../../src/app'
import { Context } from 'koa'

@Controller('/hello')
class HelloController {
  @Get('/message')
  message(ctx: Context) {
    ctx.body = 'hello world'
  }
}

@Config({
  // @ts-ignore
  controllers: [HelloController],
  port: 4000,
  hostname: '0.0.0.0',
})
class MyApp extends Application {
  main() {
    console.log('do extra things')
    this.start()
  }
}

MyApp.run()
