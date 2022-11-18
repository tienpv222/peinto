import css from "./App.module.scss";
import { appSplitter } from "./App.state";
import { AppAside } from "./AppAside";
import {
  SplitSecondaryPane,
  Splitter,
  SplitWindow,
} from "/src/apg-patterns/WindowSplitter";

export const App = () => {
  return (
    <SplitWindow
      label="App"
      value={appSplitter}
      reverse
      onChange={appSplitter}
      class={css.App}
    >
      <AppAside />
      <Splitter />
      <SplitSecondaryPane>foo</SplitSecondaryPane>
    </SplitWindow>
  );
};
