-- Run this query after you have already connected to your database
CREATE TABLE islander (
    id SERIAl primary key,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    nickname VARCHAR(255) NOT NULL,
    email VARCHAR (255),
    islander_icon VARCHAR (255),
    bio TEXT,
    joined_at TIMESTAMP NOT NULL,
    last_seen_at TIMESTAMP
);

CREATE TABLE interest (
    id SERIAL primary key,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE islander_interest (
    id SERIAL primary key,
    islander_id INTEGER NOT NULL,
    FOREIGN KEY (islander_id) REFERENCES islander(id),
    interest_id INTEGER NOT NULL,
    FOREIGN KEY (interest_id) REFERENCES interest(id)
);

CREATE TABLE chatroom (
    id SERIAL primary key,
    creator_id INTEGER NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES islander(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    privacy VARCHAR(255) NOT NULL,
    chatroom_icon VARCHAR (255),
    created_at TIMESTAMP NOT NULL,
    last_active_at TIMESTAMP
);

CREATE TABLE chatroom_interest (
    id SERIAL primary key,
    chatroom_id INTEGER NOT NULL,
    FOREIGN KEY (chatroom_id) REFERENCES chatroom(id),
    interest_id INTEGER NOT NULL,
    FOREIGN KEY (interest_id) REFERENCES interest(id)
);

CREATE TABLE chatroom_membership (
    id SERIAL primary key,
    member_id INTEGER NOT NULL,
    FOREIGN KEY (member_id) REFERENCES islander(id),
    chatroom_id INTEGER NOT NULL,
    FOREIGN KEY (chatroom_id) REFERENCES chatroom(id),
    member_role VARCHAR(255),
    member_joined_at TIMESTAMP NOT NULL,
    pinned_room BOOLEAN
);

CREATE TABLE message (
    id SERIAL primary key,
    chatroom_id INTEGER NOT NULL,
    FOREIGN KEY (chatroom_id) REFERENCES chatroom(id),
    sender_id INTEGER NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES islander(id),
    time_sent TIMESTAMP NOT NULL,
    content TEXT,
    message_type VARCHAR(255) NOT NULL,
    linked_content_id BIGINT
);

CREATE TABLE message_attachment (
    id SERIAL primary key,
    message_id BIGINT NOT NULL,
    FOREIGN KEY (message_id) REFERENCES message(id),
    attached_file VARCHAR(255)
);

INSERT INTO interest (name) VALUES ('Art'), ('Music'), ('Coding'), ('Cooking'), ('Books'), 
('Dancing'), ('Movies'), ('Fine Art'), ('Writing'), ('Yoga'), ('Sports');

CREATE TABLE system_notif (
    id SERIAL primary key,
    chatroom_id INTEGER NOT NULL,
    FOREIGN KEY (chatroom_id) REFERENCES chatroom(id),
    time_sent TIMESTAMP NOT NULL,
    content JSON,
    message_type VARCHAR(255) NOT NULL   
);

CREATE TABLE event (
    id SERIAL primary key,
    name VARCHAR(255) NOT NULL,
    starting_date DATE,
    starting_time TIME,
    description TEXT,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE chatroom_event (
    id SERIAL primary key,
    chatroom_id INTEGER NOT NULL,
    FOREIGN KEY (chatroom_id) REFERENCES chatroom(id),
    event_id INTEGER NOT NULL,
    FOREIGN KEY (event_id) REFERENCES event(id)
);

CREATE TABLE join_chatroom_token (
    id SERIAl primary key,
    chatroom_id INTEGER NOT NULL,
    FOREIGN KEY (chatroom_id) REFERENCES chatroom(id),
    chatroom_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

--  Added 29/11/20

CREATE TABLE sticky_message (
    id SERIAL primary key,
    chatroom_id INTEGER NOT NULL,
    FOREIGN KEY(chatroom_id) REFERENCES chatroom(id),
    content VARCHAR(255),
    check_in VARCHAR(255),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE sticky_check_in (
    id SERIAL primary key,
    sticky_id BIGINT NOT NULL,
    FOREIGN KEY(sticky_id) REFERENCES sticky_message(id),
    member_id INTEGER NOT NULL,
    FOREIGN KEY(member_id) REFERENCES islander(id),
    checked_in_at TIMESTAMP NOT NULL
);

ALTER TABLE chatroom ADD COLUMN sticky_id BIGINT;
ALTER TABLE chatroom 
ADD CONSTRAINT fk_sticky_id
FOREIGN KEY (sticky_id) REFERENCES sticky_message(id);

DROP TABLE system_notif;

--Added 30/11/2020
ALTER TABLE event ADD COLUMN starting_datetime TIMESTAMP; 
ALTER TABLE event DROP COLUMN starting_date;
ALTER TABLE event DROP COLUMN starting_time;

CREATE TABLE personal_chatroom (
    id SERIAL primary key,
    chatroom_id INTEGER NOT NULL,
    FOREIGN KEY(chatroom_id) REFERENCES chatroom(id),
    member_a_id INTEGER NOT NULL,
    FOREIGN KEY(member_a_id) REFERENCES islander(id),
    member_b_id INTEGER NOT NULL,
    FOREIGN KEY(member_b_id) REFERENCES islander(id)
);

CREATE TABLE chatroom_prefs (
    id SERIAL primary key,
    chatroom_id INTEGER NOT NULL,
    FOREIGN KEY(chatroom_id) REFERENCES chatroom(id),
    prefs JSON
);

ALTER TABLE chatroom_membership ADD COLUMN pinned_room BOOLEAN;
CREATE TABLE notifications (
    id SERIAL primary key,
    islander_id INTEGER NOT NULL,
    FOREIGN KEY (islander_id) REFERENCES islander(id),
    notify_type VARCHAR(255) NOT NULL,
    notiFy_content JSON NOT NULL
);

-- Added 2/12/2020
INSERT INTO islander (id, username, nickname, joined_at) VALUES (0, 'sys', 'sysadmin', NOW());