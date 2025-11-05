/**
 * Error Correction Modal Component
 * Multi-step modal for correcting employee data errors with full confirmation
 * Supports smart name and address splitting
 */

import { useState, useEffect } from 'react';
import { recordCorrection } from '../services/errorTracker';
import type { ProcessingError, EmployeeRecord, ErrorCorrection } from '../types';
import { IoClose } from 'react-icons/io5';

interface ErrorCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: ProcessingError;
  employee: EmployeeRecord;
  onCorrectionApplied: () => void;
}

type ModalStep = 'errors' | 'review' | 'confirm' | 'success';

/**
 * Field options mapping for enum/restricted fields
 */
const FIELD_OPTIONS: Record<string, string[]> = {
  flsa_status: ['Exempt', 'Non-Exempt'],
  pay_frequency: ['Weekly', 'Bi-weekly', 'Semi-monthly', 'Monthly'],
  fed_status: ['Single', 'Married', 'Married Filing Separately', 'Head of Household'],
  i9_status: ['Completed', 'Pending_Section_2', 'Not_Started'],
  e_verify_status: ['Authorized', 'Not_Started', 'Pending'],
  dd1_account_type: ['Checking', 'Savings'],
  dd2_account_type: ['Checking', 'Savings'],
  dd1_split_type: ['Percent', 'Flat_Amount'],
  dd2_split_type: ['Percent', 'Flat_Amount'],
  employment_type: ['Full-time', 'Part-time', 'Contractor', 'Seasonal', 'Temporary'],
  employee_status: ['Active', 'Inactive', 'Leave of Absence', 'Terminated'],
  pay_rate_type: ['Salary', 'Hourly'],
  gender: ['Male', 'Female', 'Other', 'Prefer not to say'],
  ethnicity: ['Hispanic or Latino', 'Not Hispanic or Latino', 'Prefer not to say'],
  disability_status: ['Yes', 'No', 'Prefer not to say'],
  veteran_status: ['Yes', 'No', 'Prefer not to say'],
  union_employee: ['Yes', 'No']
};

/**
 * Checks if a field has enum/restricted options
 */
function hasFieldOptions(fieldName: string): boolean {
  return fieldName in FIELD_OPTIONS;
}

/**
 * Gets options for a field
 */
function getFieldOptions(fieldName: string): string[] {
  return FIELD_OPTIONS[fieldName] || [];
}



export function ErrorCorrectionModal({
  isOpen,
  onClose,
  error,
  employee,
  onCorrectionApplied
}: ErrorCorrectionModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('errors');
  const [correctedValue, setCorrectedValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>(''); // For dropdown fields
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');
  
  // Name splitting state
  const [showNameSplit, setShowNameSplit] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Address splitting state
  const [showAddressSplit, setShowAddressSplit] = useState(false);
  const [addressType, setAddressType] = useState<'home' | 'work' | null>(null);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('errors');
      setCorrectedValue('');
      setSelectedOption('');
      setNotes('');
      setValidationError('');
      
      // Pre-populate dropdown with current value if it's a valid option
      if (hasFieldOptions(error.field)) {
        const currentValue = (employee as any)[error.field] || '';
        const options = getFieldOptions(error.field);
        if (options.includes(currentValue)) {
          setSelectedOption(currentValue);
        } else {
          setSelectedOption(''); // Reset to placeholder
        }
      }
      
      // Check for name splitting scenario - show multiple fields but keep original values
      if (error.field === 'last_name' && 
          (!employee.last_name || employee.last_name.trim() === '') &&
          employee.first_name && 
          employee.first_name.trim().split(/\s+/).length > 1) {
        // Show original values as-is, don't auto-split
        setFirstName(employee.first_name || '');
        setLastName(employee.last_name || '');
        setShowNameSplit(true);
      } else {
        setShowNameSplit(false);
      }
      
      // Check for address splitting scenario - show all fields with original values
      const addressFields = ['home_street', 'home_city', 'home_state', 'home_zip', 'work_street', 'work_city', 'work_state', 'work_zip'];
      if (addressFields.includes(error.field)) {
        const isHome = error.field.startsWith('home_');
        const addrType = isHome ? 'home' : 'work';
        setAddressType(addrType);
        
        // Show original values as-is, don't auto-split
        setStreet(isHome ? (employee.home_street || '') : (employee.work_street || ''));
        setCity(isHome ? (employee.home_city || '') : (employee.work_city || ''));
        setState(isHome ? (employee.home_state || '') : (employee.work_state || ''));
        setZip(isHome ? (employee.home_zip || '') : (employee.work_zip || ''));
        setShowAddressSplit(true);
      } else {
        setShowAddressSplit(false);
      }
    } else {
      // Reset everything when modal closes
      setShowNameSplit(false);
      setShowAddressSplit(false);
      setAddressType(null);
    }
  }, [isOpen, error, employee]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === 'errors') {
      // Validate based on split mode
      if (showNameSplit) {
        if (!firstName.trim()) {
          setValidationError('First name is required');
          return;
        }
        if (!lastName.trim()) {
          setValidationError('Last name is required');
          return;
        }
        // Validate first name doesn't contain multiple words (should be split)
        if (firstName.trim().split(/\s+/).length > 1) {
          setValidationError('First name should not contain spaces. Please enter only the first name.');
          return;
        }
      } else if (showAddressSplit) {
        if (!street.trim()) {
          setValidationError('Street address is required');
          return;
        }
        if (!city.trim()) {
          setValidationError('City is required');
          return;
        }
        if (!state.trim()) {
          setValidationError('State is required');
          return;
        }
        // Validate state is 2 characters
        if (state.trim().length !== 2) {
          setValidationError('State must be exactly 2 characters (e.g., SC, GA, NC)');
          return;
        }
        if (!zip.trim()) {
          setValidationError('ZIP code is required');
          return;
        }
        // Validate ZIP format (5 digits or 5+4 format)
        const zipRegex = /^\d{5}(-\d{4})?$/;
        if (!zipRegex.test(zip.trim())) {
          setValidationError('ZIP code must be in format 12345 or 12345-6789');
          return;
        }
        // Validate street doesn't contain combined address (should be split)
        if (street.includes(',') && street.match(/\d{5}/)) {
          setValidationError('Street address appears to contain combined address data. Please enter only the street address.');
          return;
        }
      } else {
        // Check if this is a dropdown field
        if (hasFieldOptions(error.field)) {
          if (!selectedOption || selectedOption === '') {
            setValidationError('Please select a valid option');
            return;
          }
        } else {
          // Regular text input field
          if (!correctedValue || correctedValue.trim() === '') {
            setValidationError('Please enter a corrected value');
            return;
          }
          // Field-specific validation
          if (error.field === 'home_state' || error.field === 'work_state') {
            if (correctedValue.trim().length !== 2) {
              setValidationError('State must be exactly 2 characters (e.g., SC, GA, NC)');
              return;
            }
          }
          if (error.field === 'home_zip' || error.field === 'work_zip') {
            const zipRegex = /^\d{5}(-\d{4})?$/;
            if (!zipRegex.test(correctedValue.trim())) {
              setValidationError('ZIP code must be in format 12345 or 12345-6789');
              return;
            }
          }
          if (error.field === 'ssn') {
            const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
            if (!ssnRegex.test(correctedValue.trim())) {
              setValidationError('SSN must be in format XXX-XX-XXXX');
              return;
            }
          }
          if (error.field === 'dob' || error.field === 'hire_date' || error.field === 'original_hire_date' || error.field === 'rehire_date' || error.field === 'termination_date') {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(correctedValue.trim())) {
              setValidationError('Date must be in format YYYY-MM-DD (e.g., 2025-11-01)');
              return;
            }
          }
        }
      }
      
      setValidationError('');
      setCurrentStep('review');
    } else if (currentStep === 'review') {
      setCurrentStep('confirm');
    } else if (currentStep === 'confirm') {
      // Apply corrections
      if (showNameSplit) {
        // Update both name fields
        (employee as any).first_name = firstName;
        (employee as any).last_name = lastName;
        
        // Record correction for last_name (the original error)
        const correction: Omit<ErrorCorrection, 'correctedAt'> = {
          errorId: error.id,
          originalValue: error.value || '',
          correctedValue: lastName,
          notes: notes || `Also corrected first_name to: ${firstName}` || undefined
        };
        recordCorrection(correction);
      } else if (showAddressSplit && addressType) {
        // Update all address fields
        (employee as any)[`${addressType}_street`] = street;
        (employee as any)[`${addressType}_city`] = city;
        (employee as any)[`${addressType}_state`] = state;
        (employee as any)[`${addressType}_zip`] = zip;
        
        // Record correction for the original error field
        const correctedValueForField = addressType === 'home' 
          ? (error.field === 'home_street' ? street : error.field === 'home_city' ? city : error.field === 'home_state' ? state : zip)
          : (error.field === 'work_street' ? street : error.field === 'work_city' ? city : error.field === 'work_state' ? state : zip);
        
        const correction: Omit<ErrorCorrection, 'correctedAt'> = {
          errorId: error.id,
          originalValue: error.value || '',
          correctedValue: correctedValueForField,
          notes: notes || `Also corrected all ${addressType} address fields` || undefined
        };
        recordCorrection(correction);
      } else {
        // Standard single field correction
        const finalValue = hasFieldOptions(error.field) ? selectedOption : correctedValue;
        const correction: Omit<ErrorCorrection, 'correctedAt'> = {
          errorId: error.id,
          originalValue: error.value,
          correctedValue: finalValue,
          notes: notes || undefined
        };
        recordCorrection(correction);
        
        // Update the employee record
        (employee as any)[error.field] = finalValue;
      }

      setCurrentStep('success');
      setTimeout(() => {
        onCorrectionApplied();
        onClose();
        // Reset state
        setCurrentStep('errors');
        setCorrectedValue('');
        setNotes('');
        setValidationError('');
      }, 2000);
    }
  };

  const handleBack = () => {
    if (currentStep === 'review') {
      setCurrentStep('errors');
    } else if (currentStep === 'confirm') {
      setCurrentStep('review');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Fix Error: Row {error.row}, Column {error.columnIndex !== undefined ? error.columnIndex : '-'} ({error.field})</h3>
          <button onClick={onClose} className="modal-close-btn">
            <IoClose />
          </button>
        </div>

        <div className="modal-body">
          {currentStep === 'errors' && (
            <div className="modal-step">
              <h4>Step 1: Enter Corrected Value</h4>
              <div className="form-group">
                <label>Original Value:</label>
                <div className="original-value-display">{error.value || '(empty)'}</div>
              </div>
              <div className="form-group">
                <label>Error Message:</label>
                <div className="error-message-display">{error.message}</div>
              </div>
              <div className="form-group">
                <label>Suggested Fix:</label>
                <div className="suggested-fix-display">{error.suggestedFix || 'No suggestion available'}</div>
              </div>

              {showNameSplit ? (
                <div className="form-group">
                  <label style={{ marginBottom: '0.75rem', display: 'block', fontWeight: 600 }}>
                    Update Name Fields (First Name currently contains both names):
                  </label>
                  <div className="form-group">
                    <label htmlFor="first-name">First Name: *</label>
                    <input
                      id="first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setValidationError('');
                      }}
                      placeholder="Enter first name only"
                      className="form-input"
                      autoFocus
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Current value: {employee.first_name || '(empty)'}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="last-name">Last Name: *</label>
                    <input
                      id="last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setValidationError('');
                      }}
                      placeholder="Enter last name"
                      className="form-input"
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Current value: {employee.last_name || '(empty)'}
                    </div>
                  </div>
                  {validationError && (
                    <div className="validation-error">{validationError}</div>
                  )}
                </div>
              ) : showAddressSplit && addressType ? (
                <div className="form-group">
                  <label style={{ marginBottom: '0.75rem', display: 'block', fontWeight: 600 }}>
                    Update {addressType === 'home' ? 'Home' : 'Work'} Address Fields:
                  </label>
                  <div className="form-group">
                    <label htmlFor="address-street">Street: *</label>
                    <input
                      id="address-street"
                      type="text"
                      value={street}
                      onChange={(e) => {
                        setStreet(e.target.value);
                        setValidationError('');
                      }}
                      placeholder="Enter street address only (no city, state, zip)"
                      className="form-input"
                      autoFocus
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Current: {addressType === 'home' ? (employee.home_street || '(empty)') : (employee.work_street || '(empty)')}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label htmlFor="address-city">City: *</label>
                      <input
                        id="address-city"
                        type="text"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          setValidationError('');
                        }}
                        placeholder="Enter city"
                        className="form-input"
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Current: {addressType === 'home' ? (employee.home_city || '(empty)') : (employee.work_city || '(empty)')}
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="address-state">State: *</label>
                      <input
                        id="address-state"
                        type="text"
                        value={state}
                        onChange={(e) => {
                          setState(e.target.value.toUpperCase());
                          setValidationError('');
                        }}
                        placeholder="ST"
                        className="form-input"
                        maxLength={2}
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Current: {addressType === 'home' ? (employee.home_state || '(empty)') : (employee.work_state || '(empty)')}
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="address-zip">Zip: *</label>
                      <input
                        id="address-zip"
                        type="text"
                        value={zip}
                        onChange={(e) => {
                          setZip(e.target.value);
                          setValidationError('');
                        }}
                        placeholder="12345"
                        className="form-input"
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Current: {addressType === 'home' ? (employee.home_zip || '(empty)') : (employee.work_zip || '(empty)')}
                      </div>
                    </div>
                  </div>
                  {validationError && (
                    <div className="validation-error">{validationError}</div>
                  )}
                </div>
              ) : hasFieldOptions(error.field) ? (
                <div className="form-group">
                  <label htmlFor="corrected-value">Corrected Value: *</label>
                  <select
                    id="corrected-value"
                    value={selectedOption}
                    onChange={(e) => {
                      setSelectedOption(e.target.value);
                      setValidationError('');
                    }}
                    className="form-input"
                    autoFocus
                  >
                    <option value="" disabled>Select...</option>
                    {getFieldOptions(error.field).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Current value: {(employee as any)[error.field] || '(empty)'}
                  </div>
                  {validationError && (
                    <div className="validation-error">{validationError}</div>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="corrected-value">Corrected Value: *</label>
                  <input
                    id="corrected-value"
                    type="text"
                    value={correctedValue}
                    onChange={(e) => {
                      setCorrectedValue(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="Enter the corrected value"
                    className="form-input"
                    autoFocus
                  />
                  {validationError && (
                    <div className="validation-error">{validationError}</div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="notes">Optional Notes:</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this correction (optional)"
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="modal-step">
              <h4>Step 2: Review Employee Data</h4>
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Please review all employee data below to ensure it's correct:
              </p>
              <div className="employee-data-review">
                <div className="data-row">
                  <span className="data-label">Employee ID:</span>
                  <span className="data-value">{employee.employee_id}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Name:</span>
                  <span className="data-value">
                    {showNameSplit ? `${firstName} ${lastName}` : `${employee.first_name} ${employee.last_name}`}
                  </span>
                </div>
                {showAddressSplit && addressType && (
                  <div className="data-row highlight">
                    <span className="data-label">{addressType === 'home' ? 'Home' : 'Work'} Address:</span>
                    <span className="data-value">{street}, {city}, {state} {zip}</span>
                  </div>
                )}
                <div className="data-row">
                  <span className="data-label">Date of Birth:</span>
                  <span className="data-value">{employee.dob}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">SSN:</span>
                  <span className="data-value">{employee.ssn}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Hire Date:</span>
                  <span className="data-value">{employee.hire_date}</span>
                </div>
                {!showNameSplit && !showAddressSplit && (
                  <div className="data-row highlight">
                    <span className="data-label">Corrected Field ({error.field}):</span>
                    <span className="data-value">{hasFieldOptions(error.field) ? selectedOption : correctedValue}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'confirm' && (
            <div className="modal-step">
              <h4>Step 3: Confirm Correction</h4>
              <div className="confirmation-summary">
                <p><strong>You are about to correct:</strong></p>
                <div className="summary-item">
                  <span className="summary-label">Row:</span>
                  <span className="summary-value">{error.row}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Column:</span>
                  <span className="summary-value">{error.field}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Original Value:</span>
                  <span className="summary-value">{error.value || '(empty)'}</span>
                </div>
                {showNameSplit ? (
                  <>
                    <div className="summary-item highlight">
                      <span className="summary-label">Corrected First Name:</span>
                      <span className="summary-value">{firstName}</span>
                    </div>
                    <div className="summary-item highlight">
                      <span className="summary-label">Corrected Last Name:</span>
                      <span className="summary-value">{lastName}</span>
                    </div>
                  </>
                ) : showAddressSplit && addressType ? (
                  <>
                    <div className="summary-item highlight">
                      <span className="summary-label">Corrected {addressType === 'home' ? 'Home' : 'Work'} Address:</span>
                      <span className="summary-value">{street}, {city}, {state} {zip}</span>
                    </div>
                  </>
                ) : (
                  <div className="summary-item highlight">
                    <span className="summary-label">Corrected Value:</span>
                    <span className="summary-value">{hasFieldOptions(error.field) ? selectedOption : correctedValue}</span>
                  </div>
                )}
                {notes && (
                  <div className="summary-item">
                    <span className="summary-label">Notes:</span>
                    <span className="summary-value">{notes}</span>
                  </div>
                )}
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Once confirmed, please click "Check Your File for Errors" again to verify the correction.
              </p>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="modal-step">
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', color: 'var(--success-color)', marginBottom: '1rem' }}>✓</div>
                <h4 style={{ color: 'var(--success-color)', marginBottom: '0.5rem' }}>Correction Applied Successfully!</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Please click "Check Your File for Errors" again to verify.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {currentStep !== 'success' && (
            <>
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              {currentStep !== 'errors' && (
                <button onClick={handleBack} className="btn btn-secondary">
                  Back
                </button>
              )}
              <button 
                onClick={handleNext} 
                className="btn btn-primary"
                disabled={
                  currentStep === 'errors' && 
                  (showNameSplit 
                    ? (!firstName.trim() || !lastName.trim())
                    : showAddressSplit
                    ? (!street.trim() || !city.trim() || !state.trim() || !zip.trim())
                    : (hasFieldOptions(error.field) 
                      ? (!selectedOption || selectedOption === '')
                      : (!correctedValue || correctedValue.trim() === '')))
                }
              >
                {currentStep === 'confirm' ? 'Confirm & Apply' : 'Next'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
