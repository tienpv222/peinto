import css from "./AppBar.module.scss";
import { Tab, TabList } from "/src/apg-patterns/Tabs";

export const AppBar = () => {
  return (
    <TabList class={css.AppBar}>
      <Tab class={css.AppBtnSelect} value="select" title="Select" />
      <Tab class={css.AppBtnDraw} value="draw" title="Draw" />
      <Tab class={css.AppBtnErase} value="erase" title="Eraser" />

      <div class="flex-1" />
    </TabList>
  );
};
