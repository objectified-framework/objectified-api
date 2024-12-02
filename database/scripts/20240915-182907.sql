CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO obj.user (username, password, email_address, verified, status, source)
    VALUES ('system',  crypt('password', gen_salt('md5')), 'none@none@com', true, 'enabled', 'system');
INSERT INTO obj.group (name, description) VALUES ('system', 'Objectified System');
INSERT INTO obj.group_user (group_id, user_id) VALUES ((SELECT id FROM obj.group WHERE name='system'),
    (SELECT id FROM obj.user WHERE username='system'));
INSERT INTO obj.namespace (creatorid, name, description) VALUES ((SELECT id FROM obj.user WHERE username='system'), 'system', 'Objectified System');

--- JSON Schema Types

-- CREATE TYPE obj.data_type_data_type AS ENUM (
--     'STRING', 'INT32', 'INT64', 'FLOAT', 'DOUBLE', 'BOOLEAN', 'DATE', 'DATE_TIME', 'URI', 'BYTE',
--     'BINARY', 'PASSWORD', 'OBJECT'
-- );

INSERT INTO obj.data_type (namespace_id, name, description, data_type, reserved) VALUES
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'string', 'String', 'STRING', true),
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'int32', '32-Bit Signed Integer', 'INT32', true),
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'int64', '64-Bit Signed Integer', 'INT64', true),
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'float', 'Floating Point Number', 'FLOAT', true),
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'double', 'Double Precision Number', 'DOUBLE', true),
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'boolean', 'Boolean Value', 'BOOLEAN', true),
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'date', 'Date', 'DATE', true),
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'date-time', 'Date and Time', 'DATE_TIME', true),
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'uri', 'Universal Resource Identifier', 'URI', true),
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'byte', 'Byte Representation', 'BYTE', true),
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'binary', 'Binary Data', 'BINARY', true),
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'password', 'Password String Representation', 'PASSWORD', true),
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'object', 'Any Object', 'OBJECT', true),
     ((SELECT id FROM obj.namespace WHERE name='system'),
      'null', 'Null Object', 'OBJECT', true);

--- String formats from built-ins

INSERT INTO obj.data_type (namespace_id, name, description, data_type, pattern, reserved) VALUES
    ((SELECT id FROM obj.namespace WHERE name='system'),
    'duration', 'Duration (ISO-8601)', 'STRING', '(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))', true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'email', 'Email Address (RFC-5321)', 'STRING', '([!#-''*+/-9=?A-Z^-~-]+(\.[!#-''*+/-9=?A-Z^-~-]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@([0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)*|\[((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|IPv6:((((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){6}|::((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){5}|[0-9A-Fa-f]{0,4}::((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){4}|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):)?(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){3}|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,2}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){2}|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,3}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,4}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::)((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3})|(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3})|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,5}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3})|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,6}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::)|(?!IPv6:)[0-9A-Za-z-]*[0-9A-Za-z]:[!-Z^-~]+)])', true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'idn-email', 'Internationalized Email Address (RFC-6531)', 'STRING', '^(?<localPart>(?<dotString>[0-9a-z!#$%&''*+-\/=?^_`\{|\}~\u{80}-\u{10FFFF}]+(\.[0-9a-z!#$%&''*+-\/=?^_`\{|\}~\u{80}-\u{10FFFF}]+)*)|(?<quotedString>"([\x20-\x21\x23-\x5B\x5D-\x7E\u{80}-\u{10FFFF}]|\\[\x20-\x7E])*"))(?<!.{64,})@(?<domainOrAddressLiteral>(?<addressLiteral>\[((?<IPv4>\d{1,3}(\.\d{1,3}){3})|(?<IPv6Full>IPv6:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){7})|(?<IPv6Comp>IPv6:([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,5})?::([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,5})?)|(?<IPv6v4Full>IPv6:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){5}:\d{1,3}(\.\d{1,3}){3})|(?<IPv6v4Comp>IPv6:([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,3})?::([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,3}:)?\d{1,3}(\.\d{1,3}){3})|(?<generalAddressLiteral>[a-z0-9-]*[[a-z0-9]:[\x21-\x5A\x5E-\x7E]+))\])|(?<Domain>(?!.{256,})(([0-9a-z\u{80}-\u{10FFFF}]([0-9a-z-\u{80}-\u{10FFFF}]*[0-9a-z\u{80}-\u{10FFFF}])?))(\.([0-9a-z\u{80}-\u{10FFFF}]([0-9a-z-\u{80}-\u{10FFFF}]*[0-9a-z\u{80}-\u{10FFFF}])?))*))$', true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'hostname', 'Internet Host Name (RFC-1123)', 'STRING', '^(?![0-9]+$)(?!-)[a-zA-Z0-9-]{,63}(?<!-)$', true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'idn-hostname', 'Internationalized Internet Host Name (RFC-5890)', 'STRING', null, true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'ipv4', 'IPv4 (RFC-2673)', 'STRING', '\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b', true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'ipv6', 'IPv6 (RFC-2373)', 'STRING', '(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))', true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'uuid', 'Universally Unique Identifier (RFC-4122)', 'STRING', '\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b', true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'uri-reference', 'URI Reference (RFC-3986)', 'STRING', '(?:[A-Za-z][A-Za-z0-9+.-]*:\/{2})?(?:(?:[A-Za-z0-9-._~]|%[A-Fa-f0-9]{2})+(?::([A-Za-z0-9-._~]?|[%][A-Fa-f0-9]{2})+)?@)?(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.){1,126}[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?::[0-9]+)?(?:\/(?:[A-Za-z0-9-._~]|%[A-Fa-f0-9]{2})*)*(?:\\?(?:[A-Za-z0-9-._~]+(?:=(?:[A-Za-z0-9-._~+]|%[A-Fa-f0-9]{2})+)?)(?:&|;[A-Za-z0-9-._~]+(?:=(?:[A-Za-z0-9-._~+]|%[A-Fa-f0-9]{2})+)?)*)?', true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'iri', 'Internationalized Universal Resource Identifier (RFC-3987)', 'STRING', '(?:[A-Za-z][A-Za-z0-9+.-]*:\/{2})?(?:(?:[A-Za-z0-9-._~]|%[A-Fa-f0-9]{2})+(?::([A-Za-z0-9-._~]?|[%][A-Fa-f0-9]{2})+)?@)?(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.){1,126}[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?::[0-9]+)?(?:\/(?:[A-Za-z0-9-._~]|%[A-Fa-f0-9]{2})*)*(?:\\?(?:[A-Za-z0-9-._~]+(?:=(?:[A-Za-z0-9-._~+]|%[A-Fa-f0-9]{2})+)?)(?:&|;[A-Za-z0-9-._~]+(?:=(?:[A-Za-z0-9-._~+]|%[A-Fa-f0-9]{2})+)?)*)?', true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'iri-reference', 'Internationalized URI Reference (RFC-3987)', 'STRING', '(?:[A-Za-z][A-Za-z0-9+.-]*:\/{2})?(?:(?:[A-Za-z0-9-._~]|%[A-Fa-f0-9]{2})+(?::([A-Za-z0-9-._~]?|[%][A-Fa-f0-9]{2})+)?@)?(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.){1,126}[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?::[0-9]+)?(?:\/(?:[A-Za-z0-9-._~]|%[A-Fa-f0-9]{2})*)*(?:\\?(?:[A-Za-z0-9-._~]+(?:=(?:[A-Za-z0-9-._~+]|%[A-Fa-f0-9]{2})+)?)(?:&|;[A-Za-z0-9-._~]+(?:=(?:[A-Za-z0-9-._~+]|%[A-Fa-f0-9]{2})+)?)*)?', true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'uri-template', 'Universal Resource Identifier Template (RFC-6570)', 'STRING', '^([^\x00-\x20\x7f"''%<>\\^`{|}]|%[0-9A-Fa-f]{2}|{[+#./;?&=,!@|]?((\w|%[0-9A-Fa-f]{2})(\.?(\w|%[0-9A-Fa-f]{2}))*(:[1-9]\d{0,3}|\*)?)(,((\w|%[0-9A-Fa-f]{2})(\.?(\w|%[0-9A-Fa-f]{2}))*(:[1-9]\d{0,3}|\*)?))*})*$', true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'json-pointer', 'JSON Pointer (RFC-6901)', 'STRING', '^#\/', true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'relative-json-pointer', 'Relative JSON Pointer (RFC-6901)', 'STRING', '^#\/', true),
    ((SELECT id FROM obj.namespace WHERE name='system'),
     'regex', 'Regular Expression (ECMA-262)', 'STRING', null, true);
