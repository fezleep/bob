create table lead_insights (
    id uuid primary key,
    lead_id uuid not null unique,
    summary varchar(500) not null,
    status_read varchar(300) not null,
    next_action varchar(500) not null,
    attention varchar(500),
    model varchar(120) not null,
    generated_at timestamptz not null,
    constraint fk_lead_insights_lead foreign key (lead_id) references leads (id) on delete cascade,
    constraint lead_insights_summary_not_blank check (length(trim(summary)) > 0),
    constraint lead_insights_status_read_not_blank check (length(trim(status_read)) > 0),
    constraint lead_insights_next_action_not_blank check (length(trim(next_action)) > 0),
    constraint lead_insights_model_not_blank check (length(trim(model)) > 0)
);

create index idx_lead_insights_generated_at on lead_insights (generated_at);
