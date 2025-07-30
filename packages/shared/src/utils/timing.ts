/**
 * @param {(...args: any[]) => any} func
 * @param {number} wait
 * @param {boolean} option.leading
 * @param {boolean} option.trailing
 * @returns {(...args: any[]) => any}
 */
export function debounce(func: (...args: any[]) => any, wait: number, option = { leading: false, trailing: true }) {
  let lastThis: any = null,
    lastArgs: any = null,
    timer: any = null,
    inDebounce = false;
  return function (this: any, ...args: any[]) {
    clearTimeout(timer);
    if (!inDebounce) {
      if (option.leading) func.apply(this, args);
      else {
        lastThis = this;
        lastArgs = args;
      }
    } else {
      lastThis = this;
      lastArgs = args;
    }

    inDebounce = true;
    timer = setTimeout(() => {
      if (option.trailing && lastArgs) {
        func.apply(lastThis, lastArgs);
        lastThis = lastArgs = null;
      }
      inDebounce = false;
    }, wait);
  };
}

/**
 * @param {(...args: any[]) => any} func
 * @param {number} wait
 * @param {boolean} option.leading
 * @param {boolean} option.trailing
 * @returns {(...args: any[]) => any}
 */
export function throttle(func: (...args: any[]) => any, wait: number, option = { leading: true, trailing: true }) {
  let lastThis: any = null,
    lastArgs: any = null,
    inThrottle = false;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      if (option.leading) func.apply(this, args);
      else {
        lastThis = this;
        lastArgs = args;
      }

      inThrottle = true;
      const timeout = () =>
        setTimeout(() => {
          if (option.trailing && lastArgs) {
            func.apply(lastThis, lastArgs);
            lastThis = lastArgs = null;
            timeout();
          } else {
            inThrottle = false;
          }
        }, wait);

      timeout();
    } else {
      lastThis = this;
      lastArgs = args;
    }
  };
}
