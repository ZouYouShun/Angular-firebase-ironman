export class StringHandler {
  _content: string;
  constructor(content: string) {
    this._content = content;
  }

  brToSpace() {
    this._content = this._content.replace(/<br>/g, ' ');
    return this;
  }

  replaceToBr() {
    this._content = this._content.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
    return this;
  }

  hrefToAnchor(cla?: string) {
    // get all url
    // let urls = this._content.match(/https?:\/\/[^ \r\n]+/g);

    // // if has url
    // if (urls && urls.length > 0) {
    //   // decoratate to a href
    //   urls = urls.map(url => `<a target="_blank" class="${cla || ''}" href="${url}">${url}</a>`);

    //   // content split by url and add new urls into original index
    //   const tmp = this._content.split(/https?:\/\/[^ \r\n]+/g);
    //   for (let i = urls.length; i > 0; i--) {
    //     tmp.splice(i, 0, urls[i - 1]);
    //   }
    //   // join with ''
    //   this._content = tmp.join('');
    // }
    const exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    this._content = this._content.replace(exp, `<a target="_blank" class="${cla || ''}" href="$1">$1</a>`);
    // var exp2 =/(^|[^\/])(www\.[\S]+(\b|$))/gim;
    return this;
  }

  limit(num: number) {
    if (this._content.length > num) {
      this._content = `${this._content.substr(0, num)}...`;
    }
    return this;
  }

  toString() {
    return this._content;
  }

  isEmpty() {
    return !this._content || !this._content.trim();
  }

}
