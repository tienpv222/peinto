import { $ } from "voby";
import css from "./AppAside.module.scss";
import { appAsideSplit, appTool } from "./AppAside.state";
import { AppBar } from "./AppBar";
import { TabPanel, TabProvider } from "/src/apg-patterns/Tabs";
import {
  SplitPrimaryPane,
  SplitSecondaryPane,
  Splitter,
  SplitWindow,
} from "/src/apg-patterns/WindowSplitter";
import { NumberInput } from "/src/components/NumberInput";

export const AppAside = () => {
  const w = $(9);
  const h = $(5);

  return (
    <SplitPrimaryPane as="aside" class={css.AppAside}>
      <TabProvider label="App Tabs" value={appTool} vertical>
        <AppBar />

        <SplitWindow
          label="App Panels"
          value={appAsideSplit}
          vertical
          reverse
          class={css.AppPanels}
        >
          <SplitPrimaryPane>LayerPanel</SplitPrimaryPane>

          <Splitter />

          <SplitSecondaryPane>
            <TabPanel value="select">
              <NumberInput label="width" value={w} max={10} unit="X" />
              <NumberInput label="height" value={h} max={1024} unit="Y" />
            </TabPanel>

            <TabPanel value="draw">DrawPanel</TabPanel>

            <TabPanel value="erase">ErasePanel</TabPanel>
          </SplitSecondaryPane>
        </SplitWindow>
      </TabProvider>
    </SplitPrimaryPane>
  );
};
