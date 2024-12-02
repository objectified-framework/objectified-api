CREATE EXTENSION IF NOT EXISTS vector;

DROP SCHEMA IF EXISTS obj CASCADE;
CREATE SCHEMA obj;

--- User Tables

DROP TYPE IF EXISTS obj.user_status_enum CASCADE;
CREATE TYPE obj.user_status_enum AS ENUM ('enabled', 'disabled');

DROP TYPE IF EXISTS obj.user_source_enum CASCADE;
CREATE TYPE obj.user_source_enum AS ENUM ('local', 'google', 'github', 'gitlab', 'system');

DROP TABLE IF EXISTS obj.user CASCADE;
CREATE TABLE obj.user (
    id SERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    status obj.user_status_enum NOT NULL DEFAULT 'enabled',
    create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    source obj.user_source_enum NOT NULL DEFAULT 'local',
    data JSONB
);

--- Groups Tables

DROP TABLE IF EXISTS obj.group CASCADE;
CREATE TABLE obj.group (
    id SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    description VARCHAR(4096) NOT NULL,
    create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS obj.group_user CASCADE;
CREATE TABLE obj.group_user (
    group_id INT NOT NULL REFERENCES obj.group(id),
    user_id INT NOT NULL REFERENCES obj.user(id)
);

DROP INDEX IF EXISTS obj_group_users_unique CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS obj_group_users_unique ON obj.group_user(group_id, user_id);

--- Namespace Tables

DROP TYPE IF EXISTS obj.namespace_status_enum CASCADE;
CREATE TYPE obj.namespace_status_enum AS ENUM ('enabled', 'disabled');

DROP TABLE IF EXISTS obj.namespace CASCADE;
CREATE TABLE obj.namespace (
    id SERIAL NOT NULL PRIMARY KEY,
    creatorId INT NOT NULL REFERENCES obj.user(id),
    name VARCHAR(80) NOT NULL,
    description VARCHAR(4096) NOT NULL,
    status obj.namespace_status_enum NOT NULL DEFAULT 'enabled',
    create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS obj.namespace_user CASCADE;
CREATE TABLE obj.namespace_user (
    namespace_id INT NOT NULL REFERENCES obj.namespace(id),
    user_id INT NOT NULL REFERENCES obj.user(id)
);

DROP INDEX IF EXISTS obj_namespace_users_unique CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS obj_namespace_users_unique ON obj.namespace_user(namespace_id, user_id);

DROP TABLE IF EXISTS obj.namespace_group CASCADE;
CREATE TABLE obj.namespace_group (
    namespace_id INT NOT NULL REFERENCES obj.namespace(id),
    group_id INT NOT NULL REFERENCES obj.group(id)
);

DROP INDEX IF EXISTS obj_namespace_groups_unique CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS obj_namespace_groups_unique ON obj.namespace_group(namespace_id, group_id);

--- Class tables

DROP TYPE IF EXISTS obj.class_status_enum CASCADE;
CREATE TYPE obj.class_status_enum AS ENUM ('enabled', 'disabled');

DROP TABLE IF EXISTS obj.class CASCADE;
CREATE TABLE obj.class (
    id SERIAL NOT NULL PRIMARY KEY,
    namespace_id INT NOT NULL REFERENCES obj.namespace(id),
    owner_id INT NOT NULL REFERENCES obj.user(id),
    name VARCHAR(80) NOT NULL,
    description VARCHAR(4096) NOT NULL,
    status obj.class_status_enum NOT NULL DEFAULT 'enabled',
    create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    update_date TIMESTAMP WITHOUT TIME ZONE,
    disable_date TIMESTAMP WITHOUT TIME ZONE
);

DROP TABLE IF EXISTS obj.namespace_class CASCADE;
CREATE TABLE obj.namespace_class (
    namespace_id INT NOT NULL REFERENCES obj.namespace(id),
    class_id INT NOT NULL REFERENCES obj.class(id)
);

DROP INDEX IF EXISTS obj_namespace_classes_unique CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS obj_namespace_classes_unique ON obj.namespace_class(namespace_id, class_id);

--- Data Types tables - these are the widest tables in Objectified.

DROP TYPE IF EXISTS obj.data_type_data_type CASCADE;
CREATE TYPE obj.data_type_data_type AS ENUM (
    'STRING', 'INT32', 'INT64', 'FLOAT', 'DOUBLE', 'BOOLEAN', 'DATE', 'DATE_TIME', 'URI', 'BYTE',
    'BINARY', 'PASSWORD', 'OBJECT'
);

DROP TYPE IF EXISTS obj.data_type_status CASCADE;
CREATE TYPE obj.data_type_status AS ENUM ('enabled', 'disabled');

DROP TABLE IF EXISTS obj.data_type;
CREATE TABLE obj.data_type (
    id SERIAL NOT NULL PRIMARY KEY,
    namespace_id INT NOT NULL REFERENCES obj.namespace(id),
    name VARCHAR(80) NOT NULL,
    description VARCHAR(4096) NOT NULL,
    data_type obj.data_type_data_type NOT NULL,
    is_array BOOLEAN NOT NULL DEFAULT false,
    max_length INT NOT NULL DEFAULT 0,
    pattern VARCHAR(4096),
    enum_values VARCHAR(40)[],
    enum_descriptions VARCHAR(255)[],
    examples VARCHAR(4096)[],
    status obj.data_type_status NOT NULL DEFAULT 'enabled',
    reserved BOOLEAN NOT NULL DEFAULT false,
    create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    update_date TIMESTAMP WITHOUT TIME ZONE
);

DROP TABLE IF EXISTS obj.namespace_data_type CASCADE;
CREATE TABLE obj.namespace_data_type (
    namespace_id INT NOT NULL REFERENCES obj.namespace(id),
    data_type_id INT NOT NULL REFERENCES obj.data_type(id)
);

DROP INDEX IF EXISTS obj_namespace_data_type_unique CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS obj_namespace_data_type_unique ON obj.namespace_data_type(namespace_id, data_type_id);

--- Field tables

DROP TYPE IF EXISTS obj.field_status CASCADE;
CREATE TYPE obj.field_status AS ENUM ('enabled', 'disabled');

DROP TABLE IF EXISTS obj.field CASCADE;
CREATE TABLE obj.field (
    id SERIAL NOT NULL PRIMARY KEY,
    namespace_id INT NOT NULL REFERENCES obj.namespace(id),
    data_type_id INT NOT NULL REFERENCES obj.data_type(id),
    name VARCHAR(80) NOT NULL,
    description VARCHAR(4096) NOT NULL,
    default_value VARCHAR(4096) DEFAULT NULL,
    status obj.field_status NOT NULL DEFAULT 'enabled',
    create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    update_date TIMESTAMP WITHOUT TIME ZONE,
    disable_date TIMESTAMP WITHOUT TIME ZONE
);

DROP TABLE IF EXISTS obj.namespace_field CASCADE;
CREATE TABLE obj.namespace_field (
    namespace_id INT NOT NULL REFERENCES obj.namespace(id),
    field_id INT NOT NULL REFERENCES obj.field(id)
);

DROP INDEX IF EXISTS obj_namespace_field_unique CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS obj_namespace_field_unique ON obj.namespace_field(namespace_id, field_id);

--- Property tables

DROP TYPE IF EXISTS obj.property_status CASCADE;
CREATE TYPE obj.property_status AS ENUM ('enabled', 'disabled');

DROP TABLE IF EXISTS obj.property CASCADE;
CREATE TABLE obj.property (
    id SERIAL NOT NULL PRIMARY KEY,
    namespace_id INT NOT NULL REFERENCES obj.namespace(id),
    field_id INT NOT NULL REFERENCES obj.field(id),
    name VARCHAR(80) NOT NULL,
    description VARCHAR(4096) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT false,
    nullable BOOLEAN NOT NULL DEFAULT false,
    is_array BOOLEAN NOT NULL DEFAULT false,
    default_value VARCHAR(4096) DEFAULT NULL,
    status obj.property_status NOT NULL DEFAULT 'enabled',
    indexed BOOLEAN NOT NULL DEFAULT false,
    create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    update_date TIMESTAMP WITHOUT TIME ZONE,
    disable_date TIMESTAMP WITHOUT TIME ZONE
);

DROP TABLE IF EXISTS obj.object_property CASCADE;
CREATE TABLE obj.object_property (
    object_id INT NOT NULL REFERENCES obj.property(id),
    property_id INT NOT NULL REFERENCES obj.property(id)
);

DROP INDEX IF EXISTS obj_object_property_unique CASCADE;
CREATE UNIQUE INDEX obj_object_property_unique ON obj.object_property(object_id, property_id);

DROP TABLE IF EXISTS obj.namespace_property CASCADE;
CREATE TABLE obj.namespace_property (
    namespace_id INT NOT NULL REFERENCES obj.namespace(id),
    property_id INT NOT NULL REFERENCES obj.property(id)
);

DROP INDEX IF EXISTS obj_namespace_property_unique CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS obj_namespace_property_unique ON obj.namespace_property(namespace_id, property_id);

--- Instance tables

DROP TYPE IF EXISTS obj.instance_status CASCADE;
CREATE TYPE obj.instance_status AS ENUM ('active', 'deleted');

DROP TABLE IF EXISTS obj.instance CASCADE;
CREATE TABLE obj.instance (
    id SERIAL NOT NULL PRIMARY KEY,
    namespace_id INT NOT NULL REFERENCES obj.namespace(id),
    class_id INT NOT NULL REFERENCES obj.class(id),
    owner_id INT NOT NULL REFERENCES obj.user(id),
    name VARCHAR(80) NOT NULL,
    description VARCHAR(4096) NOT NULL,
    status obj.instance_status NOT NULL DEFAULT 'active',
    create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    update_date TIMESTAMP WITHOUT TIME ZONE,
    disable_date TIMESTAMP WITHOUT TIME ZONE
);

DROP TABLE IF EXISTS obj.instance_data CASCADE;
CREATE TABLE obj.instance_data (
    id SERIAL NOT NULL PRIMARY KEY,
    instance_id INT NOT NULL REFERENCES obj.instance(id),
    data JSONB,
    version INT NOT NULL DEFAULT 1,
    date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS obj.instance_vector CASCADE;
CREATE TABLE obj.instance_vector (
    id SERIAL NOT NULL PRIMARY KEY,
    instance_id INT NOT NULL REFERENCES obj.instance(id),
    vector vector
);

--- Link tables

DROP TABLE IF EXISTS obj.link_def CASCADE;
CREATE TABLE obj.link_def (
    id SERIAL NOT NULL PRIMARY KEY,
    namespace_id INT NOT NULL REFERENCES obj.namespace(id),
    t1 INT NOT NULL REFERENCES obj.class(id),
    t2 INT NOT NULL REFERENCES obj.class(id),
    name VARCHAR(80) NOT NULL,
    description VARCHAR(4096)
);

DROP TABLE IF EXISTS obj.link CASCADE;
CREATE TABLE obj.link (
    id SERIAL NOT NULL PRIMARY KEY,
    link_def_id INT NOT NULL REFERENCES obj.link_def(id),
    name VARCHAR(80) NOT NULL,
    t1 INT NOT NULL REFERENCES obj.instance(id),
    t2 INT NOT NULL REFERENCES obj.instance(id),
    t3 JSONB NULL,
    create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);
