-- Script de debuggeo: Habilitar acceso público total a carpeta anuncios.
-- Ejecutar en Supabase SQL Editor DESPUÉS del script anterior.

begin;

-- Asegurar que el bucket es público.
update storage.buckets
set public = true
where id = 'propiedades-imagenes';

-- Eliminar todas las restricciones anteriores de anuncios.
drop policy if exists storage_anuncios_public_read on storage.objects;
drop policy if exists storage_anuncios_auth_insert on storage.objects;
drop policy if exists storage_anuncios_auth_update on storage.objects;
drop policy if exists storage_anuncios_auth_delete on storage.objects;

-- Política para usuarios autenticados: permitir subir/editar/borrar en anuncios/*
create policy storage_anuncios_auth_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'propiedades-imagenes'
  and (name ilike 'anuncios/%')
);

create policy storage_anuncios_auth_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'propiedades-imagenes'
  and (name ilike 'anuncios/%')
)
with check (
  bucket_id = 'propiedades-imagenes'
  and (name ilike 'anuncios/%')
);

create policy storage_anuncios_auth_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'propiedades-imagenes'
  and (name ilike 'anuncios/%')
);

commit;
