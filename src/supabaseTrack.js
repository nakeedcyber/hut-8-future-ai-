// Supabase configuration
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Track new website signups to Supabase
export async function trackWebsiteSignup(userData) {
  try {
    // Insert into users_tracked table
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

    if (error) throw error;

    console.log('✅ User tracked in Supabase:', userData.username);
    return { success: true, data };
  } catch (error) {
    console.error('Error tracking user:', error);
    throw error;
  }
}
