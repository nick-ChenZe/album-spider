import * as Progress from 'progress';
import * as bytes from 'bytes'

export interface IProgressBarConfig {
  incomplete: string;
  complete: string;
  width: number;
  total: number;
}

export interface IProgress {
  renderThrottleTimeout: number;
  tokens: { [key: string]: any };
  stream: any;
  curr: number | string;
  total: number | string;
  start: number;
  fmt: string;
  width: number;
  lastDraw: string;
  chars: any;
}

export interface Constructor<T> {
  new (...args): T;
}

export default class ProgressBar extends (<Constructor<IProgress>>Progress) {
  constructor(config: IProgressBarConfig) {
    super(config);
  }

  render(tokens): void {
    clearTimeout(this.renderThrottleTimeout);
    this.renderThrottleTimeout = null;

    if (tokens) this.tokens = tokens;

    if (!this.stream.isTTY) return;

    let ratio = <number>this.curr / <number>this.total;
    ratio = Math.min(Math.max(ratio, 0), 1);

    let percent = Math.floor(ratio * 100);
    let incomplete, complete, completeLength;
    let elapsed = new Date().getTime() - this.start;
    let eta = percent == 100 ? 0 : elapsed * (<number>this.total / (<number>this.curr) - 1);
    let rate = <number>this.curr / (elapsed / 1000);

    /* populate the bar template with percentages and timestamps */
    let str = this.fmt
      .replace(':current', <string>this.curr)
      .replace(':total', <string>this.total)
      .replace(':elapsed', isNaN(elapsed) ? '0.0' : (elapsed / 1000).toFixed(1))
      .replace(
        ':eta',
        isNaN(eta) || !isFinite(eta) ? '0.0' : (eta / 1000).toFixed(1)
      )
      .replace(':percent', percent.toFixed(0) + '%')
      .replace(':rate', bytes(Math.round(rate)));

    /* compute the available space (non-zero) for the bar */
    let availableSpace = Math.max(
      0,
      this.stream.columns - str.replace(':bar', '').length
    );
    if (availableSpace && process.platform === 'win32') {
      availableSpace = availableSpace - 1;
    }

    let width = Math.min(this.width, availableSpace);

    /* TODO: the following assumes the user has one ':bar' token */
    completeLength = Math.round(width * ratio);
    complete = Array(Math.max(0, completeLength + 1)).join(this.chars.complete);
    incomplete = Array(Math.max(0, width - completeLength + 1)).join(
      this.chars.incomplete
    );

    /* add head to the complete string */
    if (completeLength > 0) complete = complete.slice(0, -1) + this.chars.head;

    /* fill in the actual progress bar */
    str = str.replace(':bar', complete + incomplete);

    /* replace the extra tokens */
    if (this.tokens)
      for (let key in this.tokens)
        str = str.replace(':' + key, this.tokens[key]);

    if (this.lastDraw !== str) {
      this.stream.cursorTo(0);
      this.stream.write(str);
      this.stream.clearLine(1);
      this.lastDraw = str;
    }
  }
}
