import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://hpaaisyxnscherkrjnas.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYWFpc3l4bnNjaGVya3JqbmFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDg1MjAsImV4cCI6MjA5NTQ4NDUyMH0.UUgIxLsoL9HzN6BNulhe8m0F1hbo9BBEaYezLtypiho"
);
