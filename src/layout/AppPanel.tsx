import { TabPanel } from "../apg-patterns/Tabs";
import css from "./AppPanel.module.scss";

export const AppPanel = () => {
  return (
    <div class={css.AppPanel}>
      <section>
        <TabPanel value="select">SelectPanel</TabPanel>
        <TabPanel value="draw">DrawPanel</TabPanel>
        <TabPanel value="erase">ErasePanel</TabPanel>
      </section>

      <section>LayerPanel</section>
    </div>
  );
};
