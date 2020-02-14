function formatTimeStamp(timeStamp){
  return formatTime(new Date(timeStamp * 1000))
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 防抖函数
// 参数immediate值 true||false
  function debounce(fn, wait, immediate) {
    let timeout, result;
    let debounced = function() {
      let context = this;
      let args = arguments;
      if (timeout) {
        clearTimeout(timeout);
      }
      let callNow = !timeout;
      if (immediate) {
        // 已经执行过，不再执行
        timeout = setTimeout(function() {
          timeout = null;
        }, wait);
        if (callNow) {
          result = fn.apply(context, args);
        }
      } else {
        timeout = setTimeout(function() {
          result = fn.apply(context, args);
          console.log(result);
        }, wait);
      }
    };
    debounced.cancel = function() {
      clearTimeout(timeout);
      timeout = null;
    };
    return debounced;
  }

module.exports = {
  formatTimeStamp: formatTimeStamp,
  formatTime: formatTime,
  debounce: debounce
}
