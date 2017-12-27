export function getScrollbarWidth(): number {
  /**
   * Browser Scrollbar Widths (2016)
   * OSX (Chrome, Safari, Firefox) - 15px
   * Windows XP (IE7, Chrome, Firefox) - 17px
   * Windows 7 (IE10, IE11, Chrome, Firefox) - 17px
   * Windows 8.1 (IE11, Chrome, Firefox) - 17px
   * Windows 10 (IE11, Chrome, Firefox) - 17px
   * Windows 10 (Edge 12/13) - 12px
   */
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps

  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;
  // force scrollbars
  outer.style.overflow = 'scroll';

  // add innerdiv
  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;

  // remove divs
  outer.parentNode.removeChild(outer);
  /**
   * Scrollbar width will be 0 on Mac OS with the
   * default "Only show scrollbars when scrolling" setting (Yosemite and up).
   * setting defult with to 20;
   */
  return widthNoScroll - widthWithScroll || 20;
}
