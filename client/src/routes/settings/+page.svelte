<script lang="ts">
  import { deleteAccount } from "$lib/firebase/auth";
  import { goto } from "$app/navigation";
  import Dialog, { Title, Header, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";

  let showDeletionPrompt = false;
</script>

<html lang="en">
  <h2>Account Settings</h2>
  <main class="container">
    <!--Delete Account Button and Prompt-->
    <Dialog
      bind:open={showDeletionPrompt}
      aria-labelledby="confirm-account-deletion-title"
      aria-describedby="deletion-confirmation-content"
    >
      <Header>
        <Title id="confirm-account-deletion-title">Delete Account</Title>
      </Header>
      <Content id="deletion-confirmation-content">Are you sure?</Content>
      <Actions>
        <Button id="dont-delete-account">
          <Label>No</Label>
        </Button>
        <Button
          id="confirm-delete-account"
          on:click={() => {
            deleteAccount();
            goto("/");
          }}
        >
          <Label>Yes</Label>
        </Button>
      </Actions>
    </Dialog>

    <Button id="delete-account" on:click={() => (showDeletionPrompt = true)}>
      <Label>Delete Account</Label>
    </Button>
    <Button class="-item-change-password">
      <Label>Change Password</Label>
    </Button>
    <!--EOF Delete Account Button and Prompt-->
  </main>
</html>

<style>
  .container {
    display: grid;
    display: inline-grid;
    justify-content: center;
    align-items: center;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
    gap: 0 0;
  }

  #delete-account {
    grid-column-start: 1;
    grid-row-start: 1;
  }

  .item-change-password {
    grid-column-start: 1;
    grid-row-start: 2;
  }
</style>
