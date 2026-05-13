create table app_metadata (
    key varchar(100) primary key,
    value text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

insert into app_metadata (key, value)
values ('schema_version', '1');
