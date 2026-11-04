<script>
  import {
    Button,
    Menu,
    MenuDivider,
    MenuItem,
  } from "carbon-components-svelte";

  let anchor;
  let open = false;
</script>

<Button bind:ref={anchor} onclick={() => (open = !open)}>Actions</Button>

<Menu {anchor} bind:open labelText="Actions menu">
  <MenuItem on:click={() => console.log("Cut")}>Cut</MenuItem>
  <MenuItem on:click={() => console.log("Copy")}>Copy</MenuItem>
  <MenuItem on:click={() => console.log("Paste")}>Paste</MenuItem>
  <MenuDivider />
  <MenuItem kind="danger" on:click={() => console.log("Delete")}
    >Delete</MenuItem
  >
</Menu>
