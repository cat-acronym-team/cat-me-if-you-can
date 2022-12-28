<script lang="ts">
  import { Icon, Svg } from "@smui/common";

  export let path: string;

  export let on = false;
</script>

<Icon component={Svg} viewBox="0 0 24 24" {on}>
  <path fill="currentColor" d={path} />
</Icon>
