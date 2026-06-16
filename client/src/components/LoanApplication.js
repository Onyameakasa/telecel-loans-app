import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/LoanApplication.css';

const LoanApplication = ({ userId }) => {
  const [formData, setFormData] = useState({
    amount: '',
    term: '',
    purpose: '',
    phoneNumber: '',
    monthlyIncome: '',
    employmentStatus: 'employed',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || formData.amount < 100) {
      newErrors.amount = 'Loan amount must be at least 100';
    }
    if (!formData.term || formData.term < 3 || formData.term > 60) {
      newErrors.term = 'Loan term must be between 3 and 60 months';
    }
    if (!formData.purpose || formData.purpose.trim().length < 10) {
      newErrors.purpose = 'Please provide a detailed purpose (at least 10 characters)';
    }
    if (!formData.phoneNumber || !/^\d{10,}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    if (!formData.monthlyIncome || formData.monthlyIncome < 0) {
      newErrors.monthlyIncome = 'Please enter a valid monthly income';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/loans/apply',
        {
          ...formData,
          amount: parseFloat(formData.amount),
          term: parseInt(formData.term),
          monthlyIncome: parseFloat(formData.monthlyIncome),
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      setFormData({
        amount: '',
        term: '',
        purpose: '',
        phoneNumber: '',
        monthlyIncome: '',
        employmentStatus: 'employed',
      });

      setTimeout(() => {
        setSuccess(false);
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Failed to submit application',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loan-application-container">
      <div className="loan-form-card">
        <h2>Apply for a Loan</h2>
        <p className="form-subtitle">Quick and easy loan application</p>

        {success && (
          <div className="alert alert-success">
            ✓ Application submitted successfully! Redirecting...
          </div>
        )}

        {errors.submit && (
          <div className="alert alert-error">
            ✗ {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Loan Amount (GHS)</label>
            <input
              id="amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter loan amount"
              min="100"
              step="100"
              className={errors.amount ? 'input-error' : ''}
            />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="term">Loan Term (Months)</label>
              <input
                id="term"
                type="number"
                name="term"
                value={formData.term}
                onChange={handleChange}
                placeholder="3 - 60 months"
                min="3"
                max="60"
                className={errors.term ? 'input-error' : ''}
              />
              {errors.term && <span className="error-text">{errors.term}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="monthlyIncome">Monthly Income (GHS)</label>
              <input
                id="monthlyIncome"
                type="number"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleChange}
                placeholder="Your monthly income"
                min="0"
                step="100"
                className={errors.monthlyIncome ? 'input-error' : ''}
              />
              {errors.monthlyIncome && <span className="error-text">{errors.monthlyIncome}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+233XXXXXXXXX"
              className={errors.phoneNumber ? 'input-error' : ''}
            />
            {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="employmentStatus">Employment Status</label>
            <select
              id="employmentStatus"
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
            >
              <option value="employed">Employed</option>
              <option value="self-employed">Self-Employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="student">Student</option>
              <option value="retired">Retired</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose of Loan</label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Describe why you need this loan"
              rows="4"
              className={errors.purpose ? 'input-error' : ''}
            />
            {errors.purpose && <span className="error-text">{errors.purpose}</span>}
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Submit Application'}
          </button>
        </form>
      </div>

      <div className="loan-info-card">
        <h3>Loan Information</h3>
        <div className="info-section">
          <h4>Requirements</h4>
          <ul>
            <li>Must be 18 years or older</li>
            <li>Valid phone number</li>
            <li>Stable source of income</li>
            <li>Active Telecel account</li>
          </ul>
        </div>

        <div className="info-section">
          <h4>Interest Rates</h4>
          <p>Competitive rates starting from 2% per month</p>
          <p className="note">Rates vary based on credit assessment</p>
        </div>

        <div className="info-section">
          <h4>Processing Time</h4>
          <p>Most applications approved within 24 hours</p>
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;
