--changeset users
create table users
(
    id    serial primary key,
    email varchar(255) not null unique,
    tg_id bigint
);