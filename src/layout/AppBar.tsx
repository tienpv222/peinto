import { Tab, TabList } from "../apg-patterns/Tabs";
import css from "./AppBar.module.scss";

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
