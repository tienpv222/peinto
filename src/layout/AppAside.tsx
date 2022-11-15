import { $ } from "voby";
import css from "./AppAside.module.scss";
import { appAsideSplitter, appTool } from "./AppAside.state";
import { AppBar } from "./AppBar";
import { Tabs } from "/src/apg-patterns/Tabs";
import { Split } from "/src/apg-patterns/WindowSplitter";
import { NumberInput } from "/src/components/NumberInput";

export const AppAside = () => {
  const w = $(9);
  const h = $(5);

  return (
    <Split.PrimaryPane as="aside" class={css.AppAside}>
      <Tabs.Provider
        label="App Tool"
        value={appTool}
        vertical
        onChange={appTool}
      >
        <AppBar />

        <Split.Window
          label="App Panel"
          value={appAsideSplitter}
          min="50%"
          max="70%"
          vertical
          onChange={appAsideSplitter}
          class={css.AppPanel}
        >
          <Split.PrimaryPane>
            <Tabs.Panel value="select">
              <NumberInput
                label="Width"
                value={w}
                max={10}
                unit="px"
                onChange={w}
              />
              <NumberInput label="Height" value={h} max={1024} onChange={h} />
            </Tabs.Panel>

            <Tabs.Panel value="draw">DrawPanel</Tabs.Panel>
            <Tabs.Panel value="erase">ErasePanel</Tabs.Panel>
          </Split.PrimaryPane>

          <Split.Splitter />

          <Split.SecondaryPane>LayerPanel</Split.SecondaryPane>
        </Split.Window>
      </Tabs.Provider>
    </Split.PrimaryPane>
  );
};
