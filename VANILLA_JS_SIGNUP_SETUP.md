# Adding Sign-Up Form to Your Vanilla HTML/JS App

Your app uses **vanilla HTML/JavaScript**, not React. Here's how to add Supabase tracking to your sign-up form.

## Quick Setup (2 Steps)

### Step 1: Get Your Supabase Credentials

1. Go to **Supabase Dashboard**
2. Click **Settings > API**
3. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (public key)

### Step 2: Update Your index.html

Find the register function in your `index.html` around **line 297** where it says:

```html
function renderRegister(){
```

Add this at the TOP of your `<script>` section (around line 104):

```javascript
// ===== SUPABASE SETUP =====
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL'; // Replace with your URL
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';    // Replace with your key

const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== TRACK USER TO SUPABASE =====
async function trackUserToSupabase(userData) {
  try {
    const { data, error } = await supabase
      .from('users_tracked')
      .insert({
        username: userData.username,
        email: userData.email,
        name: userData.name,
        user_type: 'User',
        github_id: null,
        is_org_member: false,
        is_repo_contributor: false,
      });

    if (error) {
      console.error('Supabase error:', error);
      return false;
    }
    console.log('✅ User tracked in Supabase');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
```

### Step 3: Add Supabase Script

Add this BEFORE your closing `</body>` tag in `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

So it looks like:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
    // All your existing code here
</script>
</body>
</html>
```

### Step 4: Track on Registration

Find this line in your code (around line 326):

```javascript
DB.saveUser(u);msg.innerHTML='<div class="msg msg-ok">✅ Created! Login now.</div>';
```

**Change it to:**

```javascript
// Track to Supabase
trackUserToSupabase({
  name: n,
  username: n.split(' ')[0], // or use email prefix
  email: e
});

DB.saveUser(u);msg.innerHTML='<div class="msg msg-ok">✅ Created! Login now.</div>';
```

## That's It! 🎉

Now when users register:
1. ✅ Account saved to localStorage (existing)
2. ✅ User added to Supabase `users_tracked` table (NEW)
3. ✅ You can see them in Supabase dashboard

## View Tracked Users

1. Go to **Supabase Dashboard**
2. Click **Table Editor**
3. Select **users_tracked**
4. You'll see all registered users!

## Example: View in Supabase

```
| id | username | email | name | created_at |
|----|----------|-------|------|------------|
| 1  | johndoe  | john@email.com | John Doe | 2026-06-10 |
| 2  | janedoe  | jane@email.com | Jane Doe | 2026-06-10 |
```

## Alternative: Use Ready-Made HTML Form

I've created a complete sign-up form at `signup-form.html`. You can:
1. **Open it directly** in browser to test
2. **Embed it** in your site
3. **Copy the code** to your index.html

## Troubleshooting

### Users not appearing in Supabase?
- Check console (F12 → Console tab)
- Verify SUPABASE_URL and SUPABASE_KEY are correct
- Make sure Supabase project is active

### Getting CORS errors?
- This is normal - your browser is blocking requests
- Use the anon key (it's public and safe)
- If persistent, check Supabase CORS settings

### Connection failed?
- Verify internet connection
- Check Supabase URL spelling
- Make sure anon key is correct

## Code Snippet: Quick Add

Copy-paste this into your registration success handler:

```javascript
// After successful registration:
await trackUserToSupabase({
  name: userFullName,
  username: userEmail.split('@')[0], // Use email prefix as username
  email: userEmail
});
```

## Next: GitHub Auto-Sync

After this works, we can set up automatic syncing of:
- GitHub org members
- GitHub repo contributors
- Running daily at 2 AM UTC

Want to test first and let me know if users appear in Supabase? 🚀
