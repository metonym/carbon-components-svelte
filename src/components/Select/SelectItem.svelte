<script>
  let className = undefined;
  export { className as class };
  export let disabled = false;
  export let hidden = false;
  export let style = undefined;
  export let text = '';
  export let value = '';

  import { getContext } from 'svelte';
  import { cx } from '../../lib';

  const ctx = getContext('Select') || getContext('TimePickerSelect');

  let selected = false;

  const unsubscribe = ctx.selectedValue.subscribe(currentValue => {
    if (currentValue === value) {
      selected = true;
    }
  });

  unsubscribe();
</script>

<option class={cx('--select-option', className)} {value} {disabled} {hidden} {style} {selected}>
  {text || value}
</option>
