(function() {
  const QUERY_PARAM_DTR = "dtr"; // Activate the DTR script
  const SPINNER_ID = "dtr-spinner";
  const CONFIG_URL =
    "https://my-json-server.typicode.com/mihaben/dtr-poc/elements";
  const COLOR_SPINNER = "#EFF1F2";

  const timeout = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const printLog = msg => {
    console.info(`-> DTR: ${msg}`);
  };

  const fetchData = url =>
    fetch(url).then(function(response) {
      return response.json();
    });

  const watchElement = element => {
    const observer = new MutationObserver(function(mutations, me) {
      console.warn(mutations);
    });
    observer.observe(element, {
      attributes: true,
      childList: true,
      characterData: true
    });
  };

  const blockPropertyElement = (element, property) => {
    let ownObjectProto = Object.getPrototypeOf(element);
    // exit if bad property
    if (!element[property]) {
      console.error(property + " is not a property of " + element.toString());
      return;
    }

    while (!Object.getOwnPropertyDescriptor(ownObjectProto, property)) {
      ownObjectProto = Object.getPrototypeOf(ownObjectProto);
    }

    let ownProperty = Object.getOwnPropertyDescriptor(ownObjectProto, property);

    const value = element[property];

    Object.defineProperty(element, property, {
      // Create a new getter for the property
      get: function() {
        console.warn(`Access getter "${property}": ${value}`);
        return ownProperty.get.call(this);
      },
      // Create a new setter for the property
      set: function(val) {
        console.warn(
          `Blocked attempt to set a freezed element with value: ${val}`
        );
      }
    });
  };

  const blockMethodElement = (element, method) =>
    (element[method] = () => console.warn(`Blocked method ${method}`));

  const freezeElement = element => {
    /* const property = "innerHTML";
    const ownObjectProto = Object.getPrototypeOf(element);
    const ownProperty = Object.getOwnPropertyDescriptor(
      ownObjectProto,
      property
    );

    Object.defineProperty(element, property, {
      get: function() {
        return ownProperty.get.call(this);
      },
      set: function(val) {
        console.warn(
          `Blocked attempt to update a freezed element with value: ${val}`
        );
      }
    }); */
    /* Object.freeze(element); */
    /* watchElement(element, "innerHTML");
    watchElement(element, "innerText");
    watchElement(element, "textContent");
    watchElement(element, "html"); */

    // Properties
    blockPropertyElement(element, "innerHTML");
    blockPropertyElement(element, "innerText");
    blockPropertyElement(element, "textContent");
    // Methods
    blockMethodElement(element, "append");
    blockMethodElement(element, "appendchild");
    blockMethodElement(element, "push");
  };

  const updateElement = ({ selector, value }) => {
    const element = document.querySelector(selector);
    if (element) {
      printLog(
        `'${selector}' previous value: ${element.innerHTML} -> ${value}`
      );
      element.innerHTML = value;
      printLog(`'innerHTML has been updated to: ${element.innerHTML}`);
      watchElement(element);
    } else {
      printLog(`element '${selector}' not found`);
    }
  };

  const createSpinnerElement = () => {
    const spinnerElement = document.createElement("div");
    const style = {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      backgroundColor: COLOR_SPINNER,
      zIndex: 999999
    };

    spinnerElement.id = SPINNER_ID;
    Object.assign(spinnerElement.style, style);

    return spinnerElement;
  };

  const addSpinner = parentElement => {
    const spinnerElement = createSpinnerElement();
    parentElement.appendChild(spinnerElement);
  };

  const removeSpinner = () => {
    document.querySelector(`#${SPINNER_ID}`).remove();
  };

  const onBodyLoaded = () => {
    return new Promise(resolve => {
      const observer = new MutationObserver(function(mutations, me) {
        const bodyElement = document.querySelector("body");
        if (bodyElement) {
          me.disconnect();
          resolve(bodyElement);
        }
      });
      observer.observe(document, {
        childList: true,
        subtree: true
      });
    });
  };

  const onDocumentReady = timeout => {
    return new Promise(resolve => {
      // Check if the document is ready
      if (document.readyState === "complete") {
        printLog("document readyState is complete");
        resolve();
      }
      // Window listener
      window.addEventListener("load", () => {
        printLog("window load event trigered");
        resolve();
      });
      // Fix: Sometimes the event is not fired.
      timeout &&
        setTimeout(() => {
          printLog(`timeout ${timeout}ms reached`);
          resolve();
        }, timeout);
    });
  };

  const getConfigQueryParam = (urlParams, config) =>
    config.find(item => urlParams.has(item.id));

  // INIT

  var urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has(QUERY_PARAM_DTR)) {
    // Only init the script if we receive ?dtr
    (async function() {
      printLog("start");
      // Wait to the body is loaded
      const bodyElement = await onBodyLoaded();
      printLog("body is loaded");
      // Add the spinner to the body
      addSpinner(bodyElement);
      printLog("spinner added");
      // Fetch the config data from the user
      const configData = await fetchData(CONFIG_URL);
      printLog("data fetched");
      // Match the config data with the query params found in the url (Now not avoid multiple values)
      const configQueryParam = getConfigQueryParam(urlParams, configData);
      // Wait to the document is ready to update the DOM
      await onDocumentReady(5000);
      printLog("document is ready");
      // Update the DOM if is required
      configQueryParam && updateElement(configQueryParam);
      printLog("updated elements");
      // Remove the spinner
      removeSpinner();
      printLog("spinner removed");
    })();
  }
})();
