<script>
  import { Theme } from "carbon-components-svelte";
</script>

<Theme
  render="toggle"
  toggle={{
    themes: ["g10", "g80"],
    offText: "Enable dark mode",
    onText: "Enable dark mode",
    hideLabel: true,
    size: "sm",
  }}
/>
