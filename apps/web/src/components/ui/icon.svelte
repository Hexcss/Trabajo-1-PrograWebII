<script lang="ts">
  let {
    name,
    size = 18,
    className = '',
    strokeWidth = 1.8,
  } = $props<{
    name:
      | 'store'
      | 'admin'
      | 'user'
      | 'logout'
      | 'profile'
      | 'sun'
      | 'moon'
      | 'language'
      | 'cart'
      | 'plus'
      | 'minus'
      | 'trash'
      | 'star'
      | 'upload'
      | 'orders'
      | 'login'
      | 'chevron-down';
    size?: number;
    className?: string;
    strokeWidth?: number;
  }>();
</script>

<svg
  class={className}
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if name === 'store'}
    <path d="M3 9l1.5-4.5A2 2 0 0 1 6.4 3h11.2a2 2 0 0 1 1.9 1.5L21 9" />
    <path d="M4 10h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <path d="M9 14h6" />
  {:else if name === 'admin'}
    <path d="M12 2l2.2 2.8 3.5.6-.6 3.5L20 12l-2.9 2.1.6 3.5-3.5.6L12 21l-2.2-2.8-3.5-.6.6-3.5L4 12l2.9-2.1-.6-3.5 3.5-.6z" />
    <circle cx="12" cy="12" r="3" />
  {:else if name === 'user'}
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.6-3.1 4.2-5 8-5s6.4 1.9 8 5" />
  {:else if name === 'logout'}
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  {:else if name === 'profile'}
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.6-3.1 4.2-5 8-5s6.4 1.9 8 5" />
    <path d="M18 6l1 1 2-2" />
  {:else if name === 'sun'}
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
  {:else if name === 'moon'}
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  {:else if name === 'language'}
    <path d="M4 5h12" />
    <path d="M10 5a15 15 0 0 1-6 11" />
    <path d="M6 10c1.4 1.8 3.3 3.4 6 5" />
    <path d="M14 15h6" />
    <path d="M17 12l-3 9" />
    <path d="M17 12l3 9" />
  {:else if name === 'cart'}
    <circle cx="9" cy="20" r="1.2" />
    <circle cx="18" cy="20" r="1.2" />
    <path d="M2 3h2l2.4 11.5a2 2 0 0 0 2 1.5h9.8a2 2 0 0 0 2-1.6L22 7H7" />
  {:else if name === 'plus'}
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  {:else if name === 'minus'}
    <path d="M5 12h14" />
  {:else if name === 'trash'}
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M6 6l1 14h10l1-14" />
    <path d="M10 10v6M14 10v6" />
  {:else if name === 'star'}
    <path d="M12 3.5l2.8 5.6 6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.6l1.1-6.2L3 10l6.2-.9z" />
  {:else if name === 'upload'}
    <path d="M12 16V4" />
    <path d="M8 8l4-4 4 4" />
    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  {:else if name === 'orders'}
    <path d="M5 3h14a2 2 0 0 1 2 2v2H3V5a2 2 0 0 1 2-2z" />
    <path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M8 12h8M8 16h5" />
  {:else if name === 'login'}
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  {:else if name === 'chevron-down'}
    <path d="M6 9l6 6 6-6" />
  {/if}
</svg>
