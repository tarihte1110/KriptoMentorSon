// src/services/auth.js
import { supabase } from '../lib/supabaseClient';

export const signUp = (email, password) =>
  supabase.auth.signUp(
    { email, password },
    { redirectTo: window.location.origin + '/profile' }
  );

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () =>
  supabase.auth.signOut();

export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};
