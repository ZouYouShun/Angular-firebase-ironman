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
    let urls = this._content.match(/https?:\/\/[^ \r\n]+/g);

    if (urls && urls.length > 0) {
      console.log(urls);
      urls = urls.map(url => `<a target="_blank" class="${cla}" href="${url}">${url}</a>`);

      const tmp = this._content.split(/https?:\/\/[^ \r\n]+/g);
      console.log(tmp);

      for (let i = urls.length; i > 0; i--) {
        tmp.splice(i, 0, urls[i - 1]);
      }
      console.log(tmp);
      this._content = tmp.join('');
    }
    // tmp.forEach((elm, i) => {
    // });
    return this;
  }


  // .map(item => {
  //   if (item.indexOf(`http://`) > -1 || item.indexOf(`https://`) > -1) {
  //     return `<a target="_blank" href="${item}">${item}</a>`;
  //   }
  //   return item;
  // })

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
