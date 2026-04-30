
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop policy if exists "Vybify images public read" on storage.objects;
create policy "Vybify images owner list" on storage.objects for select using (
  bucket_id = 'vybify-images' and auth.uid()::text = (storage.foldername(name))[1]
);
