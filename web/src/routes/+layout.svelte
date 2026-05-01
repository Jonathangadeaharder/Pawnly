<script lang="ts">
import '../app.css';
let { children } = $props();
</script>

<div class="min-h-screen bg-cream bg-[radial-gradient(circle_at_20%_10%,rgba(232,181,71,0.06)_0px,transparent_40%),radial-gradient(circle_at_80%_90%,rgba(63,107,67,0.05)_0px,transparent_50%)]">
	{@render children()}
</div>
