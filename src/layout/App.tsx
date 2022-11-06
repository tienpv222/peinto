import css from "./App.module.scss";
import { appSplitter } from "./App.state";
import { AppAside } from "./AppAside";
import { Split } from "/src/apg-patterns/WindowSplitter";

export const App = () => {
  return (
    <Split.Window
      label="App"
      value={appSplitter}
      min={300}
      max={350}
      onChange={appSplitter}
      class={css.App}
    >
      <AppAside />

      <Split.Splitter />

      <Split.SecondaryPane />
    </Split.Window>
  );
};
