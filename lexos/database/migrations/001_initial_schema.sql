-- =============================================================================
-- LexOS Database Schema v1.0
-- Multi-tenant, GDPR/LOPD compliant
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- MULTI-TENANCY: Base table for law firms / organizations
-- =============================================================================
CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(100) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    plan            VARCHAR(50)  NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter','professional','enterprise')),
    data_region     VARCHAR(50)  NOT NULL DEFAULT 'eu-west-1',  -- GDPR data residency
    pinecone_ns     VARCHAR(100) NOT NULL,  -- isolated vector namespace per tenant
    aes_key_id      VARCHAR(255),           -- reference to HSM/KMS key per tenant
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    settings        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- USERS: Authenticated members of a tenant
-- =============================================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    supabase_uid    VARCHAR(255) UNIQUE NOT NULL,  -- Auth provider UID
    email           VARCHAR(320) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    role            VARCHAR(50)  NOT NULL DEFAULT 'lawyer'
                    CHECK (role IN ('admin','lawyer','paralegal','billing','client_readonly')),
    hourly_rate     NUMERIC(10,2),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, email)
);

-- =============================================================================
-- CLIENTS: Legal clients belonging to a tenant
-- =============================================================================
CREATE TABLE clients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reference_code  VARCHAR(50) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    id_type         VARCHAR(30)  NOT NULL CHECK (id_type IN ('DNI','NIE','NIF','PASSPORT','CIF','OTHER')),
    id_number_enc   TEXT NOT NULL,          -- AES-256 encrypted
    email_enc       TEXT NOT NULL,          -- AES-256 encrypted
    phone_enc       TEXT,                   -- AES-256 encrypted
    address_enc     TEXT,                   -- AES-256 encrypted
    nationality     CHAR(2),                -- ISO 3166-1 alpha-2
    gdpr_consent    BOOLEAN NOT NULL DEFAULT FALSE,
    gdpr_consent_at TIMESTAMPTZ,
    gdpr_consent_ip INET,
    onboarding_status VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (onboarding_status IN ('pending','in_progress','id_verified','complete')),
    portal_token    VARCHAR(128) UNIQUE,    -- secure link for client portal access
    portal_token_expires_at TIMESTAMPTZ,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, reference_code)
);

-- =============================================================================
-- CASES (EXPEDIENTES): Core legal case file
-- =============================================================================
CREATE TABLE cases (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id       UUID NOT NULL REFERENCES clients(id),
    assigned_lawyer_id UUID REFERENCES users(id),
    case_number     VARCHAR(100) NOT NULL,
    title           VARCHAR(500) NOT NULL,
    description_enc TEXT,                   -- AES-256 encrypted
    practice_area   VARCHAR(100) NOT NULL CHECK (practice_area IN (
                    'civil','criminal','administrative','labor','mercantile',
                    'family','tax','intellectual_property','real_estate','other')),
    status          VARCHAR(50) NOT NULL DEFAULT 'intake'
                    CHECK (status IN ('intake','active','on_hold','pending_resolution','closed','archived')),
    kanban_column   VARCHAR(50) NOT NULL DEFAULT 'backlog'
                    CHECK (kanban_column IN ('backlog','in_progress','waiting','review','done')),
    priority        SMALLINT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 5),
    court           VARCHAR(255),
    jurisdiction    VARCHAR(100),
    opposing_party  VARCHAR(255),
    deadline        DATE,
    opened_at       DATE NOT NULL DEFAULT CURRENT_DATE,
    closed_at       DATE,
    estimated_hours NUMERIC(8,2),
    tags            TEXT[] NOT NULL DEFAULT '{}',
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, case_number)
);

-- =============================================================================
-- CASE_TASKS: Kanban tasks / procedural deadlines
-- =============================================================================
CREATE TABLE case_tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    assigned_to_id  UUID REFERENCES users(id),
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    task_type       VARCHAR(50) NOT NULL DEFAULT 'task'
                    CHECK (task_type IN ('task','deadline','hearing','filing','notification','review')),
    status          VARCHAR(50) NOT NULL DEFAULT 'todo'
                    CHECK (status IN ('todo','in_progress','blocked','done','cancelled')),
    priority        SMALLINT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 5),
    due_date        DATE,
    due_time        TIME,
    reminded_at     TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    position        INTEGER NOT NULL DEFAULT 0,  -- Kanban ordering
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- DOCUMENTS: Encrypted file storage metadata
-- =============================================================================
CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    case_id         UUID REFERENCES cases(id) ON DELETE SET NULL,
    client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
    uploaded_by_id  UUID NOT NULL REFERENCES users(id),
    filename_original VARCHAR(500) NOT NULL,
    filename_stored VARCHAR(500) NOT NULL,  -- UUID-based safe name in storage
    mime_type       VARCHAR(127) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_path    TEXT NOT NULL,           -- path in encrypted object storage
    encryption_iv   VARCHAR(64) NOT NULL,    -- AES-256-GCM IV per document
    checksum_sha256 CHAR(64) NOT NULL,       -- integrity verification
    doc_type        VARCHAR(50) NOT NULL DEFAULT 'general'
                    CHECK (doc_type IN ('contract','evidence','jurisprudence','brief',
                                        'invoice','identity','correspondence','general')),
    is_indexed      BOOLEAN NOT NULL DEFAULT FALSE,  -- ingested into vector DB
    index_status    VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (index_status IN ('pending','processing','indexed','failed')),
    index_error     TEXT,
    chunk_count     INTEGER,
    vector_ids      TEXT[],                  -- Pinecone vector IDs
    tags            TEXT[] NOT NULL DEFAULT '{}',
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- DOCUMENT_CHUNKS: RAG text chunks (metadata mirror of Pinecone)
-- =============================================================================
CREATE TABLE document_chunks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    vector_id       VARCHAR(255) NOT NULL UNIQUE,  -- Pinecone vector ID
    chunk_index     INTEGER NOT NULL,
    page_number     INTEGER,
    char_start      INTEGER,
    char_end        INTEGER,
    token_count     INTEGER,
    content_hash    CHAR(64) NOT NULL,  -- SHA-256 of chunk text (no PII in DB)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- RAG_QUERIES: Log of AI queries per tenant (privacy audit)
-- =============================================================================
CREATE TABLE rag_queries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id),
    case_id         UUID REFERENCES cases(id),
    query_hash      CHAR(64) NOT NULL,  -- hashed query (no raw query stored)
    query_type      VARCHAR(50) NOT NULL DEFAULT 'semantic_search'
                    CHECK (query_type IN ('semantic_search','risk_analysis',
                                          'summarize','jurisprudence','clause_extract')),
    doc_ids_searched UUID[] NOT NULL DEFAULT '{}',
    chunks_retrieved INTEGER NOT NULL DEFAULT 0,
    model_used      VARCHAR(100) NOT NULL,
    tokens_prompt   INTEGER,
    tokens_completion INTEGER,
    duration_ms     INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- CONTRACT_TEMPLATES: Reusable .docx/.pdf template definitions
-- =============================================================================
CREATE TABLE contract_templates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by_id   UUID NOT NULL REFERENCES users(id),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    practice_area   VARCHAR(100) NOT NULL,
    variable_schema JSONB NOT NULL DEFAULT '{}',  -- JSON Schema for template variables
    storage_path    TEXT NOT NULL,
    version         VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, name, version)
);

-- =============================================================================
-- CONTRACTS: Generated contract instances
-- =============================================================================
CREATE TABLE contracts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id     UUID NOT NULL REFERENCES contract_templates(id),
    case_id         UUID REFERENCES cases(id),
    client_id       UUID REFERENCES clients(id),
    created_by_id   UUID NOT NULL REFERENCES users(id),
    title           VARCHAR(500) NOT NULL,
    variables_enc   TEXT NOT NULL,  -- AES-256 encrypted JSON of field values
    output_path     TEXT,           -- generated document path
    status          VARCHAR(30) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','review','signed','rejected','expired')),
    signed_at       TIMESTAMPTZ,
    expires_at      DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TIME_ENTRIES: Billable hours per task/user
-- =============================================================================
CREATE TABLE time_entries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id),
    case_id         UUID NOT NULL REFERENCES cases(id),
    task_id         UUID REFERENCES case_tasks(id),
    description     VARCHAR(1000),
    started_at      TIMESTAMPTZ NOT NULL,
    ended_at        TIMESTAMPTZ,
    duration_seconds INTEGER GENERATED ALWAYS AS (
                        EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER
                    ) STORED,
    hourly_rate     NUMERIC(10,2) NOT NULL,
    amount          NUMERIC(12,2) GENERATED ALWAYS AS (
                        ROUND(
                            EXTRACT(EPOCH FROM (ended_at - started_at))::NUMERIC / 3600 * hourly_rate,
                            2
                        )
                    ) STORED,
    is_billable     BOOLEAN NOT NULL DEFAULT TRUE,
    is_billed       BOOLEAN NOT NULL DEFAULT FALSE,
    invoice_id      UUID,  -- set when billed
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INVOICES: Auto-generated proforma invoices
-- =============================================================================
CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    case_id         UUID NOT NULL REFERENCES cases(id),
    client_id       UUID NOT NULL REFERENCES clients(id),
    created_by_id   UUID NOT NULL REFERENCES users(id),
    invoice_number  VARCHAR(50) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'proforma'
                    CHECK (status IN ('proforma','sent','paid','overdue','cancelled')),
    subtotal        NUMERIC(14,2) NOT NULL,
    tax_rate        NUMERIC(5,4) NOT NULL DEFAULT 0.21,
    tax_amount      NUMERIC(14,2) NOT NULL,
    total           NUMERIC(14,2) NOT NULL,
    currency        CHAR(3) NOT NULL DEFAULT 'EUR',
    due_date        DATE,
    paid_at         TIMESTAMPTZ,
    notes           TEXT,
    output_path     TEXT,  -- generated PDF path
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, invoice_number)
);

ALTER TABLE time_entries
    ADD CONSTRAINT fk_time_entries_invoice
    FOREIGN KEY (invoice_id) REFERENCES invoices(id);

-- =============================================================================
-- CALENDAR_INTEGRATIONS: OAuth tokens for Google/Outlook
-- =============================================================================
CREATE TABLE calendar_integrations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        VARCHAR(30) NOT NULL CHECK (provider IN ('google','outlook')),
    access_token_enc  TEXT NOT NULL,   -- AES-256 encrypted
    refresh_token_enc TEXT NOT NULL,  -- AES-256 encrypted
    token_expires_at  TIMESTAMPTZ NOT NULL,
    calendar_id     VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_synced_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, user_id, provider)
);

-- =============================================================================
-- AUDIT_LOGS: IMMUTABLE append-only audit trail (GDPR Art. 30)
-- =============================================================================
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL,          -- no FK: immutable even if tenant deleted
    user_id         UUID,                   -- no FK: immutable
    client_id       UUID,
    session_id      VARCHAR(255),
    action          VARCHAR(100) NOT NULL,  -- e.g. 'document.view', 'case.update'
    resource_type   VARCHAR(50) NOT NULL,
    resource_id     VARCHAR(255),
    ip_address      INET,
    user_agent_hash CHAR(64),
    request_id      VARCHAR(255),
    outcome         VARCHAR(20) NOT NULL DEFAULT 'success'
                    CHECK (outcome IN ('success','failure','denied')),
    detail          JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log MUST be insert-only — prevent updates and deletes via security policy
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_insert_only ON audit_logs FOR INSERT WITH CHECK (TRUE);
CREATE POLICY audit_select_own  ON audit_logs FOR SELECT USING (TRUE);
-- No UPDATE or DELETE policies → blocked by default

-- =============================================================================
-- NOTIFICATIONS: System alerts (deadlines, task reminders)
-- =============================================================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL CHECK (type IN (
                    'deadline_approaching','task_assigned','document_indexed',
                    'invoice_overdue','case_status_changed','rag_query_complete')),
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    resource_type   VARCHAR(50),
    resource_id     UUID,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY: Tenant isolation for all data tables
-- =============================================================================
ALTER TABLE users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients               ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_tasks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents             ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_queries           ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices              ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;

-- Helper function: extract tenant_id from JWT set by app layer
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN (current_setting('app.current_tenant_id', TRUE))::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Apply tenant isolation policy to all tenant-scoped tables
DO $$ DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users','clients','cases','case_tasks','documents','document_chunks',
        'rag_queries','contract_templates','contracts','time_entries','invoices',
        'calendar_integrations','notifications'
    ] LOOP
        EXECUTE format(
            'CREATE POLICY tenant_isolation ON %I USING (tenant_id = current_tenant_id())', t
        );
    END LOOP;
END $$;

-- =============================================================================
-- INDEXES: Performance-critical queries
-- =============================================================================
CREATE INDEX idx_users_tenant          ON users(tenant_id);
CREATE INDEX idx_users_email           ON users(email);
CREATE INDEX idx_clients_tenant        ON clients(tenant_id);
CREATE INDEX idx_clients_portal_token  ON clients(portal_token) WHERE portal_token IS NOT NULL;
CREATE INDEX idx_cases_tenant          ON cases(tenant_id);
CREATE INDEX idx_cases_client          ON cases(client_id);
CREATE INDEX idx_cases_lawyer          ON cases(assigned_lawyer_id);
CREATE INDEX idx_cases_status          ON cases(tenant_id, status);
CREATE INDEX idx_cases_deadline        ON cases(deadline) WHERE deadline IS NOT NULL AND status != 'closed';
CREATE INDEX idx_case_tasks_case       ON case_tasks(case_id);
CREATE INDEX idx_case_tasks_due        ON case_tasks(due_date) WHERE status NOT IN ('done','cancelled');
CREATE INDEX idx_documents_case        ON documents(case_id);
CREATE INDEX idx_documents_index       ON documents(tenant_id, is_indexed, index_status);
CREATE INDEX idx_chunks_document       ON document_chunks(document_id);
CREATE INDEX idx_time_entries_case     ON time_entries(case_id);
CREATE INDEX idx_time_entries_unbilled ON time_entries(tenant_id, is_billable, is_billed)
    WHERE is_billable = TRUE AND is_billed = FALSE;
CREATE INDEX idx_audit_tenant_time     ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_resource        ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_notifications_user    ON notifications(user_id, is_read, created_at DESC);

-- =============================================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'tenants','users','clients','cases','case_tasks','documents',
        'contract_templates','contracts','time_entries','invoices',
        'calendar_integrations'
    ] LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t
        );
    END LOOP;
END $$;

-- =============================================================================
-- DEADLINE ALERT FUNCTION: Called by pg_cron or app scheduler
-- =============================================================================
CREATE OR REPLACE FUNCTION generate_deadline_notifications()
RETURNS INTEGER AS $$
DECLARE inserted_count INTEGER;
BEGIN
    WITH upcoming AS (
        SELECT
            c.tenant_id,
            c.assigned_lawyer_id AS user_id,
            c.id AS case_id,
            c.case_number,
            c.title,
            c.deadline,
            CASE
                WHEN c.deadline = CURRENT_DATE     THEN 'HOY'
                WHEN c.deadline = CURRENT_DATE + 1 THEN 'MAÑANA'
                ELSE (c.deadline - CURRENT_DATE)::TEXT || ' días'
            END AS when_label
        FROM cases c
        WHERE c.deadline BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
          AND c.status NOT IN ('closed','archived')
          AND c.assigned_lawyer_id IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM notifications n
              WHERE n.user_id = c.assigned_lawyer_id
                AND n.resource_id = c.id
                AND n.type = 'deadline_approaching'
                AND n.created_at >= CURRENT_DATE
          )
    )
    INSERT INTO notifications (tenant_id, user_id, type, title, body, resource_type, resource_id)
    SELECT
        tenant_id, user_id,
        'deadline_approaching',
        'Plazo próximo: ' || case_number,
        'El expediente "' || title || '" vence en ' || when_label,
        'case', case_id
    FROM upcoming;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
