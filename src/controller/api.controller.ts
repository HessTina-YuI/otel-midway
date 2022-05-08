import { Inject, Controller, Get, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { startSpan } from '../utils/tracer';

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Get('/get_user')
  async getUser(@Query('uid') uid) {
    const span = startSpan('APIController#getUser()');
    const user = await this.userService.getUser({ uid });
    span.end();
    return { success: true, message: 'OK', data: user };
  }
}
