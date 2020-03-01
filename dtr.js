(function() {
  const QUERY_PARAM_DTR = "dtr"; // Activate the DTR script
  const SPINNER_ID = "dtr-spinner";
  const CONFIG_URL =
    "https://my-json-server.typicode.com/mihaben/dtr-poc/elements";
  const COLOR_SPINNER = "#1EFF9F";

  const timeout = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const fetchData = url =>
    fetch(url).then(function(response) {
      return response.json();
    });

  const updateElement = ({ selector, value }) => {
    const element = document.querySelector(selector);
    if (element) {
      element.innerHTML = value;
    } else {
      console.warn(`element ${selector} not found`);
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

  const onWindowsLoad = timeout => {
    return new Promise(resolve => {
      window.addEventListener("load", resolve);
      // Fix: Sometimes the event is not fired.
      timeout && setTimeout(resolve, timeout);
    });
  };

  const getConfigQueryParam = (urlParams, config) =>
    config.find(item => urlParams.has(item.id));

  // INIT

  var urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has(QUERY_PARAM_DTR)) {
    // Only init the script if we receive ?dtr
    (async function() {
      // Wait to the body is loaded
      const bodyElement = await onBodyLoaded();
      // Add the spinner to the body
      addSpinner(bodyElement);
      // Fetch the config data from the user
      const configData = await fetchData(CONFIG_URL);
      // Match the config data with the query params found in the url (Now not avoid multiple values)
      const configQueryParam = getConfigQueryParam(urlParams, configData);
      // Wait to the windows is loaded to update the DOM
      await onWindowsLoad(1500);
      // Update the DOM if is required
      configQueryParam && updateElement(configQueryParam);
      // Remove the spinner
      removeSpinner();
    })();
  }
})();
