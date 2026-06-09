alter table leads
    add column next_follow_up_at timestamptz;

create index idx_leads_next_follow_up_at on leads (next_follow_up_at)
    where next_follow_up_at is not null;
