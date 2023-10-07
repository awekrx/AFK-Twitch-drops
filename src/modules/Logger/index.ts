import { green, red, yellow, blue } from 'colors';
import moment from 'moment';

export class Logger {
  private readonly username: string;

  constructor(username?: string) {
    this.username = username
      ? yellow(`[${username}]`)
      : blue("[Watchers' Master]");
  }

  private get time(): string {
    const time = moment().format('hh:mm:ss');

    return green(`[${time}]`);
  }

  public error(message: string): void {
    const error = red('[Error]');

    console.log(`${this.time}${this.username}${error}: ${message}`);
  }

  public log(message: string): void {
    console.log(`${this.time}${this.username}: ${message}`);
  }
}
