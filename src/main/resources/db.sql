--changeset users
create table users
(
    id    serial primary key,
    email varchar(255) not null unique,
    tg_id bigint
);

--changeset users:email->logto_id
alter table users
    rename column email to logto_id;

--changeset users:createdAt+updatedAt
alter table users
    rename column tg_id to tgId;

alter table users
    drop column id;

alter table users
    rename column logto_id to id;

alter table users
    add primary key (id),
    add unique (id);

alter table users
    add column createdAt timestamp not null default now(),
    add column updatedAt timestamp not null default now();