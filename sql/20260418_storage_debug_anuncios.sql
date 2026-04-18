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

-- Política simple: permitir lectura pública de CUALQUIER archivo en anuncios/*
-- (sin restricciones adicionales de RLS).
create policy anuncios_public_read
on storage.objects
for select
using (
  bucket_id = 'propiedades-imagenes'
  and (name ilike 'anuncios/%')
);

-- Política para usuarios autenticados: permitir subir/editar/borrar en anuncios/*
create policy anuncios_auth_write
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'propiedades-imagenes'
  and (name ilike 'anuncios/%')
);

commit;
