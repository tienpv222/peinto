import "the-new-css-reset/css/reset.css";
import "uno.css";
import { render } from "voby";
import { App } from "./layout/App";

/** METHODS */

export const renderApp = () => render(App, document.body);

/** HMR */

if (import.meta.hot) {
  const { data } = import.meta.hot;

  if (!data.dispose) {
    data.dispose = renderApp();
  }

  import.meta.hot.accept((newModule) => {
    if (!newModule) return;

    data.dispose();
    data.dispose = newModule.renderApp();
  });
} else {
  renderApp();
}
