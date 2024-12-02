--- Users sessions

DROP TABLE IF EXISTS obj.session CASCADE;
CREATE TABLE obj.session (
    user_id INT NOT NULL REFERENCES obj.user(id),
    session_id UUID NOT NULL,
    session_time INT NOT NULL,
    session_timeout INT NOT NULL,
    data JSONB
);

