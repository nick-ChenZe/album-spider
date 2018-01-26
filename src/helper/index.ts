function padZero(num: number, digit: number = 2) {
  let expression = num.toString();
  while (expression.length < digit) expression = '0' + expression;
  return expression;
}

function isIntact(num: number): boolean {
  return num > 1;
}

export function formatTimestamp(interval: number): string {
  let intervalTimeStamp: number = interval / 1000;
  let ms: string = (interval / 1000).toFixed(2);

  let hours: number = Math.floor(intervalTimeStamp / 3600);
  let minutes: number = Math.floor((intervalTimeStamp - hours * 3600) / 60);
  let seconds: number = intervalTimeStamp - hours * 3600 - minutes * 60;

  let str: string = '';
  if (isIntact(hours)) {
    str = hours + '.' + padZero(minutes / 60);
  } else if (isIntact(minutes)) {
    str = minutes + '.' + padZero(seconds / 60);
  } else {
    str = seconds + '.' + ms;
  }

  return str;
}
