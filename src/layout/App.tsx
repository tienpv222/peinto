import { Tabs } from "../apg-patterns/Tabs";
import "./App.scss";
import { AppBar } from "./AppBar";
import { AppPanel } from "./AppPanel";

export const App = () => {
  return (
    <Tabs label="toolbar" vertical>
      <AppBar />
      <AppPanel />
    </Tabs>
  );
};
