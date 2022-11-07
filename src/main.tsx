import "the-new-css-reset/css/reset.css";
import "uno.css";
import { render } from "voby";
import { App } from "./layout/App";

export const renderApp = () => {
  return render(App, document.body);
};

if (import.meta.hot) {
  const { data } = import.meta.hot;

  if (!data.dispose) {
    data.dispose = renderApp();
  }

  import.meta.hot.accept((newModule) => {
    if (newModule) {
      data.dispose();
      data.dispose = newModule.renderApp();
    }
  });
} else {
  renderApp();
}
