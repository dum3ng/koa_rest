# usage

```ts
@Controller("/api")
class HelloController {
  @Get("/hello")
  async hello(ctx) {
    ctx.body = "hello world!";
  }
}
```
