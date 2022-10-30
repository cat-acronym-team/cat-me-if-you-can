<script lang="ts">
  import { deleteAccount, logOut } from "$lib/firebase/auth";
  import { goto } from "$app/navigation";
  import Dialog, { Title, Header, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";

  let showDeletionPrompt = false;
</script>

<html lang="en">
  <h2>Account Settings</h2>
  <main>
    <div class="wrapper">
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

      <div class="item-del-account">
        <Button on:click={() => (showDeletionPrompt = true)}>
          <Label>Delete Account</Label>
        </Button>
      </div>
      <div class="item-change-pass">
        <Button>
          <Label>Change Password</Label>
        </Button>
      </div>
      <!--EOF Delete Account Button and Prompt-->

      <!--Signout button-->
      <div class="item-signout">
        <Button
          on:click={() => {
            logOut();
            goto("/");
          }}>Sign Out</Button
        >
      </div>
      <!--End Signout button-->
    </div>
  </main>
</html>

<style>
  .wrapper {
    display: grid;
    display: inline-grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 25px 25px;
  }

  .item-del-account {
    grid-column: 1;
    grid-row: 1;
    border: 2px solid rgb(32, 218, 171);
  }

  .item-change-pass {
    grid-column: 1;
    grid-row: 2;
    border: 2px solid rgb(32, 218, 171);
  }

  .item-signout {
    grid-column: 1;
    grid-row: 3;
    border: 2px solid rgb(32, 218, 171);
  }
</style>
