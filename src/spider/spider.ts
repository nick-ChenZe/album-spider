import * as request from 'request-promise';
import * as bytes from 'bytes';
import { formatTimestamp } from '../helper';

export interface ISpiderConfig {
  uid: string;
  cookie: string;
}

export default class Spider {
  protected m_uid: string;
  protected m_cookie: string;
  protected m_imgTotalCount: number = 0;
  protected m_imgTotalSize: number = 0;
  protected m_imgAlbumCount: number = 0;
  protected m_startTime: number = 0;

  public static API_HOST: string = 'http://photo.weibo.com';
  public static FETCH_ALBUMS_API: string = Spider.API_HOST + '/albums/get_all';
  public static FETCH_PHOTOS_API: string = Spider.API_HOST + '/photos/get_all';

  constructor(config: ISpiderConfig) {
    this.m_uid = config.uid;
    this.m_cookie = config.cookie;
  }

  get bundleSize(): string {
    return bytes(this.m_imgTotalSize);
  }

  get elapsed(): string {
    return formatTimestamp(new Date().getTime() - this.m_startTime);
  }

  protected async fetchWithHeader<T>(
    uri: string,
    qs?: { [key: string]: string | number },
    json: boolean = false
  ): Promise<T> {
    let headers = { Cookie: this.m_cookie, qs, json };
    return await request(uri, headers);
  }

  protected async execute(): Promise<void> {
    throw new Error('');
  }
}
