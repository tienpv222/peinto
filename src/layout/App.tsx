import css from "./App.module.scss";
import { appSplit } from "./App.state";
import { AppAside } from "./AppAside";
import {
  SplitSecondaryPane,
  Splitter,
  SplitWindow,
} from "/src/apg-patterns/WindowSplitter";

export const App = () => {
  return (
    <SplitWindow label="App" value={appSplit} reverse class={css.App}>
      <AppAside />
      <Splitter />
      <SplitSecondaryPane>foo</SplitSecondaryPane>
    </SplitWindow>
  );
};
