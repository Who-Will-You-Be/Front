-- ============================================================
-- AI 자기이해 기반 진로탐색 - 사용자 인증 스키마
-- ============================================================

CREATE DATABASE IF NOT EXISTS career_app
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE career_app;

-- ------------------------------------------------------------
-- 사용자 테이블
-- ------------------------------------------------------------
CREATE TABLE users (
  idx          INT           NOT NULL AUTO_INCREMENT,
  user_id      VARCHAR(50)   NOT NULL,                 -- 아이디 (로그인용)
  password     VARCHAR(255)  NOT NULL,                 -- bcrypt 해시
  name         VARCHAR(50)   NOT NULL,                 -- 이름
  school       VARCHAR(100)  NOT NULL,                 -- 학교명 (NEIS 검색 선택값)
  grade        VARCHAR(10)   NOT NULL,                 -- 학년 (초4~고2)
  email        VARCHAR(100)  NOT NULL,                 -- 이메일
  created_at   DATETIME      NOT NULL DEFAULT NOW(),
  updated_at   DATETIME      NOT NULL DEFAULT NOW() ON UPDATE NOW(),

  PRIMARY KEY (idx),
  UNIQUE KEY uq_user_id (user_id),
  UNIQUE KEY uq_email   (email)
);

-- ------------------------------------------------------------
-- 세션 테이블 (서버 세션 방식 사용 시)
-- ------------------------------------------------------------
CREATE TABLE sessions (
  session_id   VARCHAR(128)  NOT NULL,
  user_idx     INT           NOT NULL,
  created_at   DATETIME      NOT NULL DEFAULT NOW(),
  expires_at   DATETIME      NOT NULL,

  PRIMARY KEY (session_id),
  FOREIGN KEY (user_idx) REFERENCES users (idx) ON DELETE CASCADE,
  INDEX idx_expires (expires_at)
);

-- ------------------------------------------------------------
-- grade 컬럼 허용값 체크 제약
-- ------------------------------------------------------------
ALTER TABLE users
  ADD CONSTRAINT chk_grade
  CHECK (grade IN ('초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2'));

-- ------------------------------------------------------------
-- 더미 데이터 (개발/테스트용)
-- password 컬럼값은 'test1234' 를 bcrypt로 해시한 값
-- ------------------------------------------------------------
INSERT INTO users (user_id, password, name, school, grade, email) VALUES
  ('student01', '$2b$12$eImiTXuWVxfM37uY4JANjQ==.placeholder', '김민준', '서울중학교', '중2', 'minjun@example.com'),
  ('student02', '$2b$12$eImiTXuWVxfM37uY4JANjQ==.placeholder', '이서연', '강남고등학교', '고1', 'seoyeon@example.com');
