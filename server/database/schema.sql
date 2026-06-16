-- Create database schema for Telecel Loans App

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  date_of_birth DATE,
  national_id VARCHAR(50) UNIQUE,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  term_months INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  interest_rate DECIMAL(5, 2) DEFAULT 2.0,
  monthly_payment DECIMAL(12, 2),
  total_amount_due DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  disbursed_at TIMESTAMP
);

-- Loan Applications table (detailed application info)
CREATE TABLE IF NOT EXISTS loan_applications (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  monthly_income DECIMAL(12, 2) NOT NULL,
  employment_status VARCHAR(50) NOT NULL,
  employer_name VARCHAR(255),
  job_title VARCHAR(100),
  years_employed INTEGER,
  marital_status VARCHAR(50),
  dependents INTEGER DEFAULT 0,
  credit_score INTEGER,
  application_status VARCHAR(50) DEFAULT 'SUBMITTED',
  rejection_reason TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id),
  documents_submitted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan Payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  payment_amount DECIMAL(12, 2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100) UNIQUE,
  status VARCHAR(50) DEFAULT 'COMPLETED',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan Status History table
CREATE TABLE IF NOT EXISTS loan_status_history (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  reason TEXT,
  changed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan Documents table
CREATE TABLE IF NOT EXISTS loan_documents (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_url VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  status VARCHAR(50) DEFAULT 'PENDING',
  verified_at TIMESTAMP,
  verified_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  permissions TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_loan_id ON loan_applications(loan_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(application_status);
CREATE INDEX idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX idx_loan_payments_status ON loan_payments(status);
CREATE INDEX idx_loan_status_history_loan_id ON loan_status_history(loan_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to loans table
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to loan_applications table
CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to loan_payments table
CREATE TRIGGER update_loan_payments_updated_at BEFORE UPDATE ON loan_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to loan_documents table
CREATE TRIGGER update_loan_documents_updated_at BEFORE UPDATE ON loan_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to admin_users table
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
