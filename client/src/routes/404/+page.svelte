<script lang="ts">
  import ErrorPage from "$components/ErrorPage.svelte";
  import Button, { Label } from "@smui/button";
</script>

<ErrorPage heading="404 Not Found" body="The page you looking for isn't here.">
  <Button slot="button" href="/" variant="raised">
    <Label>Go Home</Label>
  </Button>
</ErrorPage>
