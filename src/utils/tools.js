/**
 *
 * @param {*} imgUrl //图片地址
 * @param {*} fileName  //下载的图片名
 */
export function downloadFile(imgUrl, fileName) {
  let link = document.createElement('a');
  fetch(imgUrl)
    .then(res => res.blob())
    .then(blob => {
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
    });
}

/**
 * 获取文件类型
 */
export function getFileType(fileName) {
  let flieArr = fileName.split('.');
  let suffix = flieArr[flieArr.length - 1];
  let fileType = '';
  switch (suffix) {
    case 'doc':
    case 'docx':
      fileType = 'word';
      break;
    case 'xlsx':
    case 'xls':
      fileType = 'excel';
      break;
    case 'ppt':
    case 'pptx':
      fileType = 'ppt';
      break;
    case 'pdf':
      fileType = 'pdf';
      break;
    case 'txt':
      fileType = 'txt';
      break;
    default:
      fileType = '';
  }
  return fileType;
}

/**
 * 获取地址参数
 * @param {*} name 参数名
 * @returns
 */
export function getQueryString(name) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  const r = window.location.search.substr(1).match(reg) || window.location.hash.substring(window.location.hash.search(/\?/) + 1).match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]);
  }
}
