[
  {
    "table_schema": "cron",
    "table_name": "job",
    "column_name": "jobid",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": "nextval('cron.jobid_seq'::regclass)"
  },
  {
    "table_schema": "cron",
    "table_name": "job",
    "column_name": "schedule",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "cron",
    "table_name": "job",
    "column_name": "command",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "cron",
    "table_name": "job",
    "column_name": "nodename",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "'localhost'::text"
  },
  {
    "table_schema": "cron",
    "table_name": "job",
    "column_name": "nodeport",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": "inet_server_port()"
  },
  {
    "table_schema": "cron",
    "table_name": "job",
    "column_name": "database",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "current_database()"
  },
  {
    "table_schema": "cron",
    "table_name": "job",
    "column_name": "username",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "CURRENT_USER"
  },
  {
    "table_schema": "cron",
    "table_name": "job",
    "column_name": "active",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": "true"
  },
  {
    "table_schema": "cron",
    "table_name": "job",
    "column_name": "jobname",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "cron",
    "table_name": "job_run_details",
    "column_name": "jobid",
    "data_type": "bigint",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "cron",
    "table_name": "job_run_details",
    "column_name": "runid",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": "nextval('cron.runid_seq'::regclass)"
  },
  {
    "table_schema": "cron",
    "table_name": "job_run_details",
    "column_name": "job_pid",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "cron",
    "table_name": "job_run_details",
    "column_name": "database",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "cron",
    "table_name": "job_run_details",
    "column_name": "username",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "cron",
    "table_name": "job_run_details",
    "column_name": "command",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "cron",
    "table_name": "job_run_details",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "cron",
    "table_name": "job_run_details",
    "column_name": "return_message",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "cron",
    "table_name": "job_run_details",
    "column_name": "start_time",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "cron",
    "table_name": "job_run_details",
    "column_name": "end_time",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "net",
    "table_name": "_http_response",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "net",
    "table_name": "_http_response",
    "column_name": "status_code",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "net",
    "table_name": "_http_response",
    "column_name": "content_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "net",
    "table_name": "_http_response",
    "column_name": "headers",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "net",
    "table_name": "_http_response",
    "column_name": "content",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "net",
    "table_name": "_http_response",
    "column_name": "timed_out",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "net",
    "table_name": "_http_response",
    "column_name": "error_msg",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "net",
    "table_name": "_http_response",
    "column_name": "created",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "net",
    "table_name": "http_request_queue",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": "nextval('net.http_request_queue_id_seq'::regclass)"
  },
  {
    "table_schema": "net",
    "table_name": "http_request_queue",
    "column_name": "method",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "net",
    "table_name": "http_request_queue",
    "column_name": "url",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "net",
    "table_name": "http_request_queue",
    "column_name": "headers",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "net",
    "table_name": "http_request_queue",
    "column_name": "body",
    "data_type": "bytea",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "net",
    "table_name": "http_request_queue",
    "column_name": "timeout_milliseconds",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "censo",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": "nextval('censo_id_seq'::regclass)"
  },
  {
    "table_schema": "public",
    "table_name": "censo",
    "column_name": "posicion",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "censo",
    "column_name": "chapa",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "censo",
    "column_name": "color",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "censo",
    "column_name": "created_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "censo",
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "censo",
    "column_name": "trincador",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "public",
    "table_name": "configuracion_usuario",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": "nextval('configuracion_usuario_id_seq'::regclass)"
  },
  {
    "table_schema": "public",
    "table_name": "configuracion_usuario",
    "column_name": "chapa",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "configuracion_usuario",
    "column_name": "irpf_porcentaje",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": "2.00"
  },
  {
    "table_schema": "public",
    "table_name": "configuracion_usuario",
    "column_name": "ultima_actualizacion",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "configuracion_usuario",
    "column_name": "created_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "jornales",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": "nextval('jornales_id_seq'::regclass)"
  },
  {
    "table_schema": "public",
    "table_name": "jornales",
    "column_name": "fecha",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jornales",
    "column_name": "chapa",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jornales",
    "column_name": "puesto",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jornales",
    "column_name": "jornada",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jornales",
    "column_name": "empresa",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jornales",
    "column_name": "buque",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jornales",
    "column_name": "parte",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jornales",
    "column_name": "origen",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'importacion'::character varying"
  },
  {
    "table_schema": "public",
    "table_name": "jornales",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "mapeo_puestos",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": "nextval('mapeo_puestos_id_seq'::regclass)"
  },
  {
    "table_schema": "public",
    "table_name": "mapeo_puestos",
    "column_name": "puesto",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "mapeo_puestos",
    "column_name": "grupo_salarial",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "mapeo_puestos",
    "column_name": "tipo_operativa",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "mapeo_puestos",
    "column_name": "created_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "mapeo_puestos",
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "mensajes_foro",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": "nextval('mensajes_foro_id_seq'::regclass)"
  },
  {
    "table_schema": "public",
    "table_name": "mensajes_foro",
    "column_name": "chapa",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "mensajes_foro",
    "column_name": "texto",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "mensajes_foro",
    "column_name": "created_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "primas_personalizadas",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": "nextval('primas_personalizadas_id_seq'::regclass)"
  },
  {
    "table_schema": "public",
    "table_name": "primas_personalizadas",
    "column_name": "chapa",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "primas_personalizadas",
    "column_name": "fecha",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "primas_personalizadas",
    "column_name": "jornada",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "primas_personalizadas",
    "column_name": "prima_personalizada",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_schema": "public",
    "table_name": "primas_personalizadas",
    "column_name": "movimientos_personalizados",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_schema": "public",
    "table_name": "primas_personalizadas",
    "column_name": "relevo",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_schema": "public",
    "table_name": "primas_personalizadas",
    "column_name": "remate",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_schema": "public",
    "table_name": "primas_personalizadas",
    "column_name": "ultima_actualizacion",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "primas_personalizadas",
    "column_name": "created_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "push_subscriptions",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_schema": "public",
    "table_name": "push_subscriptions",
    "column_name": "endpoint",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "push_subscriptions",
    "column_name": "p256dh",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "push_subscriptions",
    "column_name": "auth",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "push_subscriptions",
    "column_name": "user_chapa",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "push_subscriptions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "stripe_webhooks",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_schema": "public",
    "table_name": "stripe_webhooks",
    "column_name": "stripe_event_id",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "stripe_webhooks",
    "column_name": "tipo_evento",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "stripe_webhooks",
    "column_name": "payload",
    "data_type": "jsonb",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "stripe_webhooks",
    "column_name": "procesado",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "public",
    "table_name": "stripe_webhooks",
    "column_name": "error",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "stripe_webhooks",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "stripe_webhooks",
    "column_name": "procesado_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "tabla_salarios",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": "nextval('tabla_salarios_id_seq'::regclass)"
  },
  {
    "table_schema": "public",
    "table_name": "tabla_salarios",
    "column_name": "clave_jornada",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "tabla_salarios",
    "column_name": "jornada",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "tabla_salarios",
    "column_name": "tipo_dia",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "tabla_salarios",
    "column_name": "jornal_base_g1",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "tabla_salarios",
    "column_name": "jornal_base_g2",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "tabla_salarios",
    "column_name": "coef_prima_menor120",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "tabla_salarios",
    "column_name": "coef_prima_mayor120",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "tabla_salarios",
    "column_name": "prima_minima_coches",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "tabla_salarios",
    "column_name": "created_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "tabla_salarios",
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  }
]