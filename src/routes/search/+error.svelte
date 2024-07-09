<script>
	import { page } from "$app/stores";
	$: message = $page.error?.message ?? "Something happened";
	$: status = $page.status;
</script>

<h1>{status}:{message}</h1>
<div>
	{JSON.stringify($page.error)}
</div>
