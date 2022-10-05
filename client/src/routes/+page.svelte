<script lang="ts">
  import question from "$lib/assets/question-mark.svg";
  import Modal from "$components/Modal.svelte";
  import { saveDisplayName, getDisplayName } from "$lib/firebase/splash";
  import { onMount } from "svelte";
  import { getAuth } from "firebase/auth"
  // import stores like user id, isLoggedIn, to query and update their doc
  // import { auth } from "../stores/auth";
  
  const auth = getAuth();
  const user = auth.currentUser;
  //check if the user is logged in with getAuth

  let openRulesModal = false;
  let openSignInModal = false;
  let name: string = "";
  // get name from database
  onMount(async () => {
    const { displayName } = await getDisplayName(`userid`);
    // assign name from database to name variable
    if (displayName !== "") {
      name = displayName;
    }
    // if no name then it is empty
  });
  const saveName = (e: any) => {
    name = e.target.value as string;
    saveDisplayName("userid", name);
  };
</script>

<!-- Rules Modal -->
<Modal
  open={openRulesModal}
  onClosed={() => {
    openRulesModal = false;
  }}
>
  <div class="rules-heading">
    <h1>Rules!</h1>
  </div>
  <div class="rules-body">
    <!-- Rules Content Here -->
  </div>
</Modal>
<!-- Sign In Modal -->
<Modal
  open={openSignInModal}
  onClosed={() => {
    openSignInModal = false;
  }}
>
  <!-- Sign In Modal Content Here -->
</Modal>
<header class="cat-main-header">
  <div class="header-first-level">
    <div
      class="question-container"
      on:click={() => {
        openRulesModal = true;
      }}
    >
      <img src={question} alt="question mark" />
    </div>
    <div class="account-container">
      <!-- If you are not signed in show this  -->
      {#if user == null}
      <a class="account-signin">Sign in</a>
      {/if}
      <!-- If you show account and dropdown -->
      {#if user !== null}
      <a class="account-account">Account</a>
      <!-- Hover doesn't work on mobile -->
      <div class="account-content">
        <a href="/settings">Account Settings</a>
        <a href="/stats">Stats</a>
        <a href="/logout">Logout</a>
      </div>
      {/if} 
    </div>
  </div>
</header>

<main class="cat-main-container">
  <div class="cat-main">
    <div class="logo-container">
      <img src="https://cataas.com/cat/says/hello%20world!" alt="our logo" />
    </div>
    <div class="cat-main-buttons">
      <input type="text" placeholder="Enter in your display name" on:change={saveName} value={name} />
      <a>Create Lobby</a>
      <a>Join Lobby</a>
    </div>
  </div>
</main>

<style>
  /* Phone Styles */
  .cat-main-header {
    width: 100%;
  }
  .header-first-level {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .question-container {
    width: 7%;
    padding: 5px;
  }
  .question-container img {
    width: 100%;
    object-fit: cover;
  }
  .account-signin {
    text-decoration: none;
    margin-right: 5px;
    color: red;
    background-color: #151515;
    padding: 5px;
  }
  .account-account {
    text-decoration: none;
    margin-right: 5px;
    color: red;
    background-color: #151515;
    padding: 5px;
  }
  .account-container button {
    background-color: #151515;
    color: red;
    padding: 16px;
    font-size: 16px;
    border: none;
  }
   
  .account-container {
    position: relative;
    display: inline-block;
  }

  .account-content {
    display: none;
    position: absolute;
    background-color: #151515;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  .account-content a {
    color: red;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }

  .account-content a:hover, .account-content a:active {
    background-color: #ddd;
  }
  /* Using active after hover should work for mobile */
  .account-container.account-account:hover, .account-container.account-account:active .account-content {
    display: block;
  }

  .account-container.account-account:hover button {
    background-color: red;
  } 

  .logo-container {
    width: 50%;
    margin: auto;
  }
  .logo-container img {
    width: 100%;
  }
  .cat-main-container {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 70%;
  }
  .cat-main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    margin-top: auto;
    margin-bottom: auto;
  }
  .cat-main-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 70%;
    margin: auto;
  }
  .cat-main-buttons input {
    width: 100%;
    height: 25px;
    text-align: center;
  }
  .cat-main-buttons a {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    margin-top: 20px;
    background-color: #151515;
    color: red;
    width: 100%;
    height: 45px;
  }
  /* Tablet Styles */
  @media only screen and (min-width: 700px) {
    .account-container {
      margin-right: 10px;
    }
    .logo-container {
      width: 40%;
    }
    .cat-main-buttons input {
      height: 35px;
      font-size: 1.4em;
    }
    .cat-main-buttons a {
      height: 50px;
      font-size: 1.4em;
    }
  }
  /* Desktop Styles */
  @media only screen and (min-width: 1000px) {
    .question-container {
      width: 3%;
    }
    .logo-container {
      width: 20%;
    }
    .cat-main-buttons {
      width: 35%;
    }
    .cat-main-buttons a {
      height: 60px;
    }
  }
</style>
