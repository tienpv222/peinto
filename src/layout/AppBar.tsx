import css from "./AppBar.module.scss";
import { Tabs } from "/src/apg-patterns/Tabs";

export const AppBar = () => {
  return (
    <Tabs.List class={css.AppBar}>
      <Tabs.Tab class={css.AppBtnSelect} value="select" title="Select" />
      <Tabs.Tab class={css.AppBtnDraw} value="draw" title="Draw" />
      <Tabs.Tab class={css.AppBtnErase} value="erase" title="Eraser" />

      <div class="flex-1" />

      <a
        title="Github"
        href="https://github.com/tienpv222/peinto"
        target="_blank"
      />
    </Tabs.List>
  );
};
