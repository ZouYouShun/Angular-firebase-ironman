// Alan:參考來源：http://www.qmo-a.com/blog/?p=2904
export function getIEVersion(): number {
  let rv = -1;
  if (navigator.appName === 'Microsoft Internet Explorer') {
    const ua = navigator.userAgent;
    const re = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');
    if (re.exec(ua) != null)
      rv = parseFloat(RegExp.$1);
  } else if (navigator.appName === 'Netscape') {
    const ua = navigator.userAgent;
    const re = new RegExp('Trident/.*rv:([0-9]{1,}[\.0-9]{0,})'); // for IE 11
    if (re.exec(ua) != null)
      rv = parseFloat(RegExp.$1);
  }
  return rv;
}
