import Spider, { ISpiderConfig } from './spider';

interface IAlbum {
  album_id: string;
  uid: string;
  count: {
    photos: number;
  };
}

interface IPhoto {
  pic_name: string;
  pic_host: string;
}

export default class WeiboJsonSpider extends Spider {
  constructor(config: ISpiderConfig) {
    super(config);
  }

  private async fetchAllPhotoOfAlbum(album_id: string,uid: string): Promise<void> {
    let page = 1;
    let count = 30;
    let uri = Spider.FETCH_PHOTOS_API;
    let isJson = true;
    let qs = { uid, album_id, page, count };

    let totalPage = Math.ceil(this.m_imgTotalCount / count);
    while (page <= totalPage) {
      qs.page = page;
      let photos = await this.fetchWithHeader<IPhoto[]>(uri, qs, isJson);
      for (let photo of photos) {
        let { pic_name: name, pic_host: host } = photo;
        let src = `${host}/large/${name}`;
        let dest = `./${uid}/${name}`;
        await fetchAndWritePhoto(src, dest);
      }
      page++;
    }
  }

  private accumulate(sum: number, album: IAlbum): number {
    return sum + album.count.photos;
  }

  async execute(): Promise<void> {
    let uri = Spider.FETCH_ALBUMS_API;
    let qs = {};
    let isJson = true;
    let albums = await this.fetchWithHeader<IAlbum[]>(uri, qs, isJson);

    this.m_imgAlbumCount = albums.reduce(this.accumulate, 0);

    for (let album of albums) {
      await this.fetchAllPhotoOfAlbum(album.album_id, album.uid);
    }
  }
}
