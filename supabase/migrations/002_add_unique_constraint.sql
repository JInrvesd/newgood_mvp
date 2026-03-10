-- H5: analysis_results의 (resume_id, version) 중복 방지
ALTER TABLE analysis_results
ADD CONSTRAINT uq_analysis_resume_version UNIQUE (resume_id, version);
