import { $ } from "voby";
import css from "./AppAside.module.scss";
import { appAsideSplitter, appTool } from "./AppAside.state";
import { AppBar } from "./AppBar";
import { Tabs } from "/src/apg-patterns/Tabs";
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
      <Tabs.Provider
        label="App Tabs"
        value={appTool}
        vertical
        onChange={appTool}
      >
        <AppBar />

        <SplitWindow
          label="App Panels"
          value={appAsideSplitter}
          vertical
          reverse
          onChange={appAsideSplitter}
          class={css.AppPanels}
        >
          <SplitPrimaryPane>LayerPanel</SplitPrimaryPane>

          <Splitter />

          <SplitSecondaryPane>
            <Tabs.Panel value="select">
              <NumberInput
                label="width"
                value={w}
                max={10}
                unit="px"
                onChange={w}
              />
              <NumberInput label="height" value={h} max={1024} onChange={h} />
            </Tabs.Panel>

            <Tabs.Panel value="draw">DrawPanel</Tabs.Panel>

            <Tabs.Panel value="erase">ErasePanel</Tabs.Panel>
          </SplitSecondaryPane>
        </SplitWindow>
      </Tabs.Provider>
    </SplitPrimaryPane>
  );
};
