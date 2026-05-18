create table users (
    id uuid primary key,
    email varchar(320) not null unique,
    display_name varchar(160) not null,
    password_hash varchar(255) not null,
    role varchar(40) not null,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create index idx_users_email on users (email);
