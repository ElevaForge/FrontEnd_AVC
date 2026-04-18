-- Cambios para habilitar tablón de anuncios y robustecer gestión de multimedia.
-- Ejecutar en Supabase SQL Editor.

begin;

-- 1) Tabla de anuncios para sitio público y gestión admin.
create table if not exists public.anuncios (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(trim(titulo)) >= 5),
  resumen text,
  contenido text not null check (char_length(trim(contenido)) >= 10),
  tipo text not null default 'General' check (tipo in ('General', 'Promocion', 'Urgente', 'Evento')),
  prioridad integer not null default 0 check (prioridad between 0 and 100),
  activo boolean not null default true,
  destacado boolean not null default false,
  galeria_urls text[] default '{}'::text[],
  imagen_url text,
  video_url text,
  cta_texto text,
  cta_url text,
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint anuncios_fecha_valida check (
    fecha_fin is null or fecha_inicio is null or fecha_fin >= fecha_inicio
  )
);

alter table if exists public.anuncios
  add column if not exists galeria_urls text[] default '{}'::text[];

create index if not exists idx_anuncios_activo_fechas
  on public.anuncios (activo, fecha_inicio, fecha_fin);

create index if not exists idx_anuncios_prioridad_destacado
  on public.anuncios (destacado desc, prioridad desc, created_at desc);

-- Trigger genérico updated_at.
create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_anuncios_updated_at on public.anuncios;
create trigger trg_anuncios_updated_at
before update on public.anuncios
for each row
execute function public.set_updated_at_timestamp();

alter table public.anuncios enable row level security;

-- Lectura pública solo para anuncios activos y vigentes.
drop policy if exists anuncios_public_read on public.anuncios;
create policy anuncios_public_read
on public.anuncios
for select
to anon, authenticated
using (
  activo = true
  and (fecha_inicio is null or fecha_inicio <= now())
  and (fecha_fin is null or fecha_fin >= now())
);

-- Gestión completa para usuarios autenticados (ajustable a rol admin si existe).
drop policy if exists anuncios_auth_manage on public.anuncios;
create policy anuncios_auth_manage
on public.anuncios
for all
to authenticated
using (true)
with check (true);

-- 2) Mejoras de metadatos en multimedia de propiedades para auditoría y performance.
alter table if exists public.imagenes_propiedad
  add column if not exists mime_type text,
  add column if not exists size_bytes bigint,
  add column if not exists storage_path text,
  add column if not exists checksum_sha256 text;

-- Guardar la ruta en storage_path permite eliminar sin parsear URL pública.
create index if not exists idx_imagenes_propiedad_storage_path
  on public.imagenes_propiedad (storage_path);

create index if not exists idx_imagenes_propiedad_principal
  on public.imagenes_propiedad (propiedad_id, es_principal);

-- Restricción opcional de tamaño según tipo (si tipo_archivo existe en la tabla).
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'imagenes_propiedad'
      and column_name = 'tipo_archivo'
  ) then
    begin
      alter table public.imagenes_propiedad
        drop constraint if exists imagenes_propiedad_size_check;

      alter table public.imagenes_propiedad
        add constraint imagenes_propiedad_size_check
        check (
          size_bytes is null
          or (
            (tipo_archivo = 'image' and size_bytes <= 8 * 1024 * 1024)
            or (tipo_archivo = 'video' and size_bytes <= 80 * 1024 * 1024)
          )
        );
    exception
      when undefined_column then
        null;
    end;
  end if;
end;
$$;

-- 3) RPCs usadas por el frontend/admin para borrado seguro.
create or replace function public.delete_imagenes_by_ids(image_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.imagenes_propiedad where id = any(image_ids);
end;
$$;

grant execute on function public.delete_imagenes_by_ids(uuid[]) to anon, authenticated, service_role;

create or replace function public.delete_property_and_images(prop_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.imagenes_propiedad where propiedad_id = prop_id;
  delete from public.propiedades where id = prop_id;
end;
$$;

grant execute on function public.delete_property_and_images(uuid) to anon, authenticated, service_role;

-- 4) Storage para multimedia de anuncios.
-- Si el bucket no es público, las URL devueltas por getPublicUrl no cargarán en la vista cliente.
update storage.buckets
set public = true
where id = 'propiedades-imagenes';

-- Lectura pública de archivos en carpeta anuncios/.
drop policy if exists storage_anuncios_public_read on storage.objects;
create policy storage_anuncios_public_read
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'propiedades-imagenes'
  and name like 'anuncios/%'
);

-- Gestión de anuncios para usuarios autenticados (insert).
drop policy if exists storage_anuncios_auth_insert on storage.objects;
create policy storage_anuncios_auth_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'propiedades-imagenes'
  and name like 'anuncios/%'
);

-- Gestión de anuncios para usuarios autenticados (update).
drop policy if exists storage_anuncios_auth_update on storage.objects;
create policy storage_anuncios_auth_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'propiedades-imagenes'
  and name like 'anuncios/%'
)
with check (
  bucket_id = 'propiedades-imagenes'
  and name like 'anuncios/%'
);

-- Gestión de anuncios para usuarios autenticados (delete).
drop policy if exists storage_anuncios_auth_delete on storage.objects;
create policy storage_anuncios_auth_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'propiedades-imagenes'
  and name like 'anuncios/%'
);

commit;
