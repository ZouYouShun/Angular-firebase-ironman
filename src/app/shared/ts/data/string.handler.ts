export class StringHandler {
  _content: string;
  constructor(content: string) {
    this._content = content;
  }

  brToSpace() {
    this._content = this._content.replace(/<br>/g, ' ');
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
