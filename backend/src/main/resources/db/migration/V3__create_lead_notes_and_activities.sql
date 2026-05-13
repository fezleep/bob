create table lead_notes (
    id uuid primary key,
    lead_id uuid not null,
    content varchar(4000) not null,
    created_at timestamptz not null,
    constraint fk_lead_notes_lead foreign key (lead_id) references leads (id) on delete cascade,
    constraint lead_notes_content_not_blank check (length(trim(content)) > 0)
);

create index idx_lead_notes_lead_id on lead_notes (lead_id);
create index idx_lead_notes_created_at on lead_notes (created_at);

create table lead_activities (
    id uuid primary key,
    lead_id uuid not null,
    type varchar(40) not null,
    description varchar(1000) not null,
    created_at timestamptz not null,
    constraint fk_lead_activities_lead foreign key (lead_id) references leads (id) on delete cascade,
    constraint lead_activities_type_check check (type in ('LEAD_CREATED', 'STATUS_CHANGED', 'NOTE_ADDED')),
    constraint lead_activities_description_not_blank check (length(trim(description)) > 0)
);

create index idx_lead_activities_lead_id on lead_activities (lead_id);
create index idx_lead_activities_created_at on lead_activities (created_at);
