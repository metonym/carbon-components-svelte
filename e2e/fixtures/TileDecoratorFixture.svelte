<script>
  import {
    AILabel,
    ClickableTile,
    ExpandableTile,
    RadioTile,
    SelectableTile,
    Tile,
    TileGroup,
  } from "carbon-components-svelte";

  // Short words, so every line runs close to the edge of the content box.
  const text =
    "We pick the best plan for you and the team so you can get on with it";
</script>

<!-- 160px wide: narrow enough that the text meets the corner. -->
{#each ["ltr", "rtl"] as dir}
  <div
    {dir}
    data-testid="tiles-{dir}"
    style="display: flex; flex-wrap: wrap; gap: 1rem"
  >
    <div data-testid="tile" style="width: 160px">
      <Tile>
        {text}
        {#snippet decorator()}<AILabel><p>Explanation</p></AILabel>{/snippet}
      </Tile>
    </div>

    <div data-testid="tile-plain" style="width: 160px">
      <Tile>{text}</Tile>
    </div>

    <div data-testid="clickable-tile" style="width: 160px">
      <ClickableTile href="#top">
        {text}
        {#snippet decorator()}<AILabel><p>Explanation</p></AILabel>{/snippet}
      </ClickableTile>
    </div>

    <div data-testid="selectable-tile" style="width: 160px">
      <SelectableTile>
        {text}
        {#snippet decorator()}<AILabel><p>Explanation</p></AILabel>{/snippet}
      </SelectableTile>
    </div>

    <div data-testid="selectable-tile-selected" style="width: 160px">
      <SelectableTile selected>
        {text}
        {#snippet decorator()}<AILabel><p>Explanation</p></AILabel>{/snippet}
      </SelectableTile>
    </div>

    <div data-testid="selectable-tile-sm" style="width: 160px">
      <SelectableTile size="sm">
        {text}
        {#snippet decorator()}<AILabel><p>Explanation</p></AILabel>{/snippet}
      </SelectableTile>
    </div>

    <!-- The AILabel docs page: 146px wide, one short line. -->
    <div data-testid="selectable-tile-docs" style="width: 146px">
      <SelectableTile>
        Recommended plan: Team
        {#snippet decorator()}<AILabel><p>Explanation</p></AILabel>{/snippet}
      </SelectableTile>
    </div>

    <div data-testid="selectable-tile-plain" style="width: 160px">
      <SelectableTile>{text}</SelectableTile>
    </div>

    <div data-testid="radio-tile" style="width: 160px">
      <TileGroup legendText="Plan" name="plan-{dir}-a">
        <RadioTile value="team">
          {text}
          {#snippet decorator()}<AILabel><p>Explanation</p></AILabel>{/snippet}
        </RadioTile>
      </TileGroup>
    </div>

    <div data-testid="radio-tile-selected" style="width: 160px">
      <TileGroup legendText="Plan" name="plan-{dir}-b" selected="team">
        <RadioTile value="team">
          {text}
          {#snippet decorator()}<AILabel><p>Explanation</p></AILabel>{/snippet}
        </RadioTile>
      </TileGroup>
    </div>

    <div data-testid="expandable-tile" style="width: 160px">
      <ExpandableTile>
        {#snippet above()}<span>{text}</span>{/snippet}
        {#snippet below()}<span>More about the plan</span>{/snippet}
        {#snippet decorator()}<AILabel><p>Explanation</p></AILabel>{/snippet}
      </ExpandableTile>
    </div>

    <div data-testid="expandable-tile-expanded" style="width: 160px">
      <ExpandableTile expanded>
        {#snippet above()}<span>{text}</span>{/snippet}
        {#snippet below()}<span>More about the plan</span>{/snippet}
        {#snippet decorator()}<AILabel><p>Explanation</p></AILabel>{/snippet}
      </ExpandableTile>
    </div>
  </div>
{/each}
