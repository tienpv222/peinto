import { TabsProvider } from "../apg-patterns/Tabs";
import css from "./App.module.scss";
import { AppBar } from "./AppBar";
import { AppPanel } from "./AppPanel";

export const App = () => {
  return (
    <div class={css.App}>
      <TabsProvider label="AppBar" value="select" vertical>
        <AppBar />
        <AppPanel />
      </TabsProvider>
    </div>
  );
};
