/**
 * @name $worker
 *
 * @param {Function} func
 * @param {Function} [fb]
 *
 * @description
 * spin up an inline web worker.
 *
 * @return {{postMessage: $worker.postMessage, onmessage: $worker.onmessage, terminate: $worker.terminate}}
 */
function $worker(func, fb) {
  // Array to be used for the blob sent to the web worker
  var blobArray = ['self.onmessage = ', func, ';'];

  // does the browser support web workers
  var hasWorkers = !!window.Worker;

  var blob, shell;

  if(blob) {
    // Create blob from the passed in function
    blob = new Blob(blobArray, { type: "text/javascript" });

    // Create new web worker. This worker will be referred to as 'shell' from now on
    shell = new Worker(window.URL.createObjectURL(blob));
  }

  return {
    postMessage : postMessage,
    onmessage   : onmessage,
    terminate   : terminate,
    loadScripts : loadScripts
  };

  /**
   * @name run
   *
   * @memberof $worker
   *
   * @description
   * run the created web worker
   *
   * @param {*} [data] - the data to be passed to the worker
   */
  function postMessage(data) {
    var worker = this;

    if(hasWorkers) {
      window.URL = window.URL || window.webkitURL;

      shell.postMessage(data);

      shell.onmessage = function(res) {
        worker.onmessage(res.data);
      };
    }
    else {
      if(typeof fb === 'function') {
        worker.onmessage(fb(data));
      }
      else {
        throw 'web workers are not supported in your current browser';
      }
    }
  }

  /**
   * @name onmessage
   *
   * @memberof $worker
   *
   * @description
   * override this func to when listening for the worker to complete
   */
  function onmessage() { }

  /**
   * @name terminate
   *
   * @memberof $worker
   *
   * @description
   * terminate the created web worker
   */
  function terminate() {
    shell.terminate();
  }

  /**
   * @name loadScripts
   *
   * @memberof $worker
   *
   * @description
   * load named function declarations into the web worker to be used by the web worker
   */
  function loadScripts() {
    var funcs = arguments;

    for(var i = 0, len = funcs.length; i < len; i++) {
      blobArray.push(funcs[i]);
    }

    blob = new Blob(blobArray, {
      type: "text/javascript"
    });

    // Create new web worker. This worker will be referred to as 'shell' from now on
    shell = new Worker(window.URL.createObjectURL(blob));
  }
}