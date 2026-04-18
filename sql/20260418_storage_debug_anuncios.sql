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

-- Reescribir URLs antiguas guardadas en anuncios para apuntar al endpoint público.
update public.anuncios
set
  imagen_url = case
    when imagen_url like '%/storage/v1/object/%' and imagen_url not like '%/storage/v1/object/public/%'
      then replace(imagen_url, '/storage/v1/object/', '/storage/v1/object/public/')
    else imagen_url
  end,
  video_url = case
    when video_url like '%/storage/v1/object/%' and video_url not like '%/storage/v1/object/public/%'
      then replace(video_url, '/storage/v1/object/', '/storage/v1/object/public/')
    else video_url
  end,
  galeria_urls = case
    when galeria_urls is null then galeria_urls
    else (
      select coalesce(array_agg(
        case
          when item like '%/storage/v1/object/%' and item not like '%/storage/v1/object/public/%'
            then replace(item, '/storage/v1/object/', '/storage/v1/object/public/')
          else item
        end
        order by ord
      ), '{}'::text[])
      from unnest(galeria_urls) with ordinality as gallery(item, ord)
    )
  end;

commit;
