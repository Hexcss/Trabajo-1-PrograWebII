<script lang="ts">
  import { Motion } from 'svelte-motion';
  import type { Snippet } from 'svelte';

  let { children, ...motionProps } = $props<{ children?: Snippet; [key: string]: unknown }>();
</script>

<Motion {...motionProps} let:motion={motion} let:props>
  <div use:motion {...props}>
    {@render children?.()}
  </div>
</Motion>
