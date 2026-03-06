-- ── resumes 테이블 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    form_data   JSONB       NOT NULL DEFAULT '{}',
    status      TEXT        NOT NULL DEFAULT 'draft',  -- draft | analyzing | analyzed
    photo_url   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── analysis_results 테이블 ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS analysis_results (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id   UUID        NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    version     INTEGER     NOT NULL DEFAULT 1,
    result_data JSONB       NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 인덱스 ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_resumes_status        ON resumes(status);
CREATE INDEX IF NOT EXISTS idx_analysis_resume_id    ON analysis_results(resume_id);
CREATE INDEX IF NOT EXISTS idx_analysis_version      ON analysis_results(resume_id, version DESC);

-- ── updated_at 자동 갱신 트리거 ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS resumes_updated_at ON resumes;
CREATE TRIGGER resumes_updated_at
    BEFORE UPDATE ON resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS 비활성화 (MVP: UUID 아는 누구나 접근) ─────────────────────
ALTER TABLE resumes          DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results DISABLE ROW LEVEL SECURITY;
