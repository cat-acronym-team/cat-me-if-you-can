<script lang="ts">
  import IconButton from "@smui/icon-button";
  import Textfield from "@smui/textfield";
  import Mdi from "$components/Mdi.svelte";
  import { mdiEye, mdiEyeOff } from "@mdi/js";

  export let value: string;
  export let autocomplete: "current-password" | "new-password";

  let showPassword = false;
</script>

<Textfield
  label="Password"
  type={showPassword ? "text" : "password"}
  bind:value
  required
  input$autocomplete={autocomplete}
>
  <IconButton
    type="button"
    on:click={(event) => event.preventDefault()}
    slot="trailingIcon"
    toggle
    bind:pressed={showPassword}
    aria-label="show password"
  >
    <Mdi path={mdiEye} on />
    <Mdi path={mdiEyeOff} />
  </IconButton>
</Textfield>
