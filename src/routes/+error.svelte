<script>
	import { page } from "$app/stores";
	console.log($page.error);
	$: message = $page.error?.message ?? "Something happened";
	$: status = $page.status;
</script>

<h1>{status}:{message}</h1>
