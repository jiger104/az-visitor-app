<script lang="ts">
  import { onMount } from 'svelte';
  let maxVisitTime = $state('');
  let maxVisitTimeError = $state('');
  let fullName = $state('');
  let message = $state('');
  let loading = $state(false);
  let recentSignIns = $state<any>([]);

  onMount(async () => {
   try {
    await getSignInEntries();
   } catch (e) {
    console.error(e);
   }
  });

  async function getSignInEntries() {
    const res = await fetch('/visitor-sign-out');
    if (res.ok) {
      recentSignIns = await res.json();
    } else {
      recentSignIns = null;
    }
  }

  function validateMaxVisitTime() {
    const value = Number(maxVisitTime);
    if (maxVisitTime === '') {
      maxVisitTimeError = '';
    } else if (isNaN(value) || value < 0 || value > 180) {
      maxVisitTimeError = 'Maximum Visit Time must be between 0 and 180.';
    } else {
      maxVisitTimeError = '';
    }
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    validateMaxVisitTime();
    if (maxVisitTimeError) {
      return;
    }
    loading = true;
    message = '';
    try {
      const res = await fetch('/visitor-sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, maxVisitTime })
      });
      if (res.ok) {
        message = 'Sign in successful!';
        fullName = '';
        maxVisitTime = '';
        await getSignInEntries();
      } else {
        message = 'Sign in failed.';
      }
    } catch (e) {
      message = 'An error occurred.';
    } finally {
      loading = false;
    }
  }

  async function signOutVisitor(id: string) {
    try {
      const res = await fetch('/visitor-sign-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        await getSignInEntries();
      } else {
        alert('Sign out failed.');
      }
    } catch (e) {
      alert('An error occurred while signing out.');
    }
  }
</script>

<style>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f7f7fa;
}
h1 {
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #333;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #fff;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  min-width: 320px;
}
input[type="text"] {
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}
button[type="submit"] {
  padding: 0.75rem 1rem;
  background: #0077ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
button[type="submit"]:hover {
  background: #005fcc;
}
.error {
  color: #d32f2f;
  font-size: 0.95rem;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
}
.success {
  color: #388e3c;
  font-size: 1rem;
  margin-top: 1rem;
}
.visitors-section {
  margin-top: 3rem;
  width: 100%;
  max-width: 1000px;
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
}
.visitors-section h2 {
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  color: #222;
}
.visitors-table {
  width: 98%;
  min-width: 900px;
  border-collapse: collapse;
  margin: 0 auto;
}
.visitors-table th, .visitors-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}
.visitors-table th {
  background: #f0f4fa;
  font-weight: 600;
}
.visitors-table tr:last-child td {
  border-bottom: none;
}
.visitors-table button[type="button"] {
  padding: 0.5rem 1rem;
  background: #d32f2f;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.visitors-table button[type="button"]:hover:enabled {
  background: #a31515;
}
.visitors-table button[type="button"]:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.visitors-table th:last-child,
.visitors-table td:last-child {
  width: 130px;
  min-width: 110px;
  text-align: center;
}
.exceeded {
  color: #d32f2f;
  font-weight: bold;
}
</style>

<div class="page-container">
  <h1>Welcome to AZ Visitor Sign In</h1>
  <form on:submit={handleSubmit}>
    <input
      type="text"
      name="fullName"
      placeholder="Full Name"
      bind:value={fullName}
      required
    />
    <input
      type="number"
      name="maxVisitTime"
      placeholder="Maximum Visit Time (minutes)"
      min="0"
      max="180"
      bind:value={maxVisitTime}
      on:input={validateMaxVisitTime}
      required
    />
    {#if maxVisitTimeError}
      <div class="error">{maxVisitTimeError}</div>
    {/if}
    <button type="submit" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
    {#if message}
      <div class="success">{message}</div>
    {/if}
  </form>

  <section class="visitors-section">
    <h2>AZ Signed In Visitors</h2>
    {#if recentSignIns && recentSignIns.length > 0}
      <table class="visitors-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Signed In At</th>
            <th>Signed Out At</th>
            <th>Max Visit Time (min)</th>
            <th>Exceeded Visit Time</th>
            <th>Sign Out</th>
          </tr>
        </thead>
        <tbody>
          {#each recentSignIns as visitor}
            <tr>
              <td>{visitor.fullName}</td>
              <td>{visitor.signedInAt}</td>
              <td>{visitor.signedOutAt ? visitor.signedOutAt : '-'}</td>
              <td>{visitor.maxVisitTime}</td>
              <td class={visitor.exceededVisitTime ? 'exceeded' : ''}>{visitor.exceededVisitTime ? 'Yes' : 'No'}</td>
              <td>
                <button type="button" on:click={() => signOutVisitor(visitor.id)} disabled={!!visitor.signedOutAt}>
                  Sign Out
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p>No visitors currently signed in.</p>
    {/if}
  </section>
</div>

