<script lang="ts">
  import { loginWithGoogle, loginWithMicrosoft, loginWithEmail } from "$lib/firebase/auth";
  let password = """;
  let email = "";
  function submitLogin(){
    if (password == ""){
      return;
    }
    if (email == ""){
      return;
    }
    loginWithEmail(email, password);
  }
</script>

<div class="container">
  <div class="google">
    <button id="google-button" on:click={loginWithGoogle}>sign in with google</button>
  </div>
  <div class="microsoft">
    <button id="microsoft-button" on:click={loginWithMicrosoft}>sign in with Microsoft</button>
  </div>
  <div class="email">
    <div class="dropdown">
      <button class="dropbtn">Dropdown</button>
      <div class="dropdown-content">
        <label for="email"><b>Email</b></label>
        <input type="text" bind:value={email} placeholder="Enter Username" name="email" required />
        <label for="password"><b>Password</b></label>
        <input type="text" bind:value={password} placeholder="Enter Password" name="password" required />
        <button on:click={submitLogin}>Login</button>
      </div>
    </div>
  </div>
  <div id="input" />
</div>

<!-- <h1>{$id}</h1> -->
<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      ". . . . . . . . ."
      ". . . . . . . . ."
      ". . . . . . . . ."
      ". . . . google . . . ."
      ". . . . microsoft . . . ."
      ". . . . email . . . ."
      ". . . . input . . . ."
      ". . . . . . . . ."
      ". . . . . . . . ."
      ". . . . . . . . .";
  }

  .google {
    grid-area: google;
    align-items: center;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .microsoft {
    grid-area: microsoft;
    align-items: center;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .email {
    grid-area: email;
    align-items: center;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  button {
    border: none;
    cursor: pointer;
    padding-left: 24dp;
    padding-right: 24dp;
    width: 150px;
    height: 50px;
  }

  #email-input {
    grid-area: input;
    align-items: center;
  }

  .dropbtn {
    background-color: grey;
    padding: 16px;
    font-size: 16px;
    border: none;
  }

  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    background-color: grey;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  .dropdown-content a:hover {
    background-color: #ddd;
  }

  .dropdown:hover .dropdown-content {
    display: block;
  }

  .dropdown:hover .dropbtn {
    background-color: grey;
  }
</style>
