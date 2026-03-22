<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import { queryClient } from '@/query/client';
  import AppRoot from '@/app/app-root.svelte';
</script>

<QueryClientProvider client={queryClient}>
  <AppRoot />
</QueryClientProvider>
