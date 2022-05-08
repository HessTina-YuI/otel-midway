import { Provide } from '@midwayjs/decorator';
import { IUserOptions } from '../interface';
import { startSpan } from '../utils/tracer';

@Provide()
export class UserService {
  async getUser(options: IUserOptions) {
    const span = startSpan('UserService#getUser()');

    const result = {
      uid: options.uid,
      username: 'mockedName',
      phone: '12345678901',
      email: 'xxx.xxx@xxx.com',
    };

    span.setAttribute('username', result.username);
    span.addEvent('finish UserService#getUser()');
    span.end();
    return result;
  }
}
