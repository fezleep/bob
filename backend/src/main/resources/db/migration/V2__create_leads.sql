create table leads (
    id uuid primary key,
    name varchar(200) not null,
    email varchar(320),
    company varchar(200),
    status varchar(20) not null,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint leads_name_not_blank check (length(trim(name)) > 0),
    constraint leads_status_check check (status in ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED', 'LOST')),
    constraint leads_email_format_check check (
        email is null
        or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    )
);

create index idx_leads_status on leads (status);
create index idx_leads_created_at on leads (created_at);
create index idx_leads_email on leads (email) where email is not null;
