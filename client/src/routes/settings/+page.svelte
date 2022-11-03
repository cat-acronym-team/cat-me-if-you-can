<script lang="ts">
  import { deleteAccount, logOut } from "$lib/firebase/auth";
  import { goto } from "$app/navigation";
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";

  let showDeletionPrompt = false;
  let errorMsg = "";
  let errPrompt = false;

  function verifyDelete() {
    try {
      deleteAccount();
      // If no error
      errorMsg = "";

      goto("/");
      return;
    } catch (err) {
      errPrompt = true;
      errorMsg = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<html lang="en">
  <h2>Account Settings</h2>
  <main>
    <!--Delete Account Button and Prompt-->
    <Dialog
      bind:open={showDeletionPrompt}
      aria-labelledby="confirm-account-deletion-title"
      aria-describedby="deletion-confirmation-content"
    >
      <Title id="confirm-account-deletion-title">Delete Account</Title>
      <Content id="deletion-confirmation-content">Are you sure?</Content>
      <Actions>
        <Button>
          <Label>Cancel</Label>
        </Button>
        <Button on:click={verifyDelete}>
          <Label>Delete Account</Label>
        </Button>
      </Actions>
    </Dialog>
    <!--If user signed in too long ago, redirect them to sign in-->
    {#if errorMsg !== ""}
      <Dialog bind:open={errPrompt} aria-labelledby="reauth-title" aria-describedby="err-msg-content">
        <Title id="reauth-title">NOTICE!</Title>
        <Content id="err-msg-content"
          >Last sign in too long ago.
          <br />Please Signin and Try Again</Content
        >
        <Actions>
          <Button
            on:click={() => {
              logOut();
              goto("/");
            }}
            ><Label>Ok</Label>
          </Button>
        </Actions>
      </Dialog>
    {/if}

    <Button on:click={() => (showDeletionPrompt = true)}>
      <Label>Delete Account</Label>
    </Button>
  </main>
</html>
