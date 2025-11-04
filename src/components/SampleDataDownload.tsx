/**
 * Sample Data Download Component
 * Provides buttons to generate messy and standard employee data samples
 */

import { generateMessyEmployeeData, generateStandardEmployeeData } from '../utils/sampleDataGenerator';
import { FaDownload } from 'react-icons/fa';

export function SampleDataDownload() {
  return (
    <div className="sample-data-download">
      <p className="sample-data-description">
        Download sample data files for testing purposes. These files are for exercise/demo purposes only.
      </p>
      <div className="sample-data-buttons">
        <button
          onClick={generateMessyEmployeeData}
          className="btn btn-warning"
          title="Generate a CSV file with intentionally messy data (combined fields, missing fields, inconsistent formats) to test error handling"
        >
          <FaDownload style={{ marginRight: '0.5rem' }} />
          Generate Messy Employee Data
        </button>
        <button
          onClick={generateStandardEmployeeData}
          className="btn btn-success"
          title="Generate a clean, properly formatted CSV file with all fields separated correctly"
        >
          <FaDownload style={{ marginRight: '0.5rem' }} />
          Generate Standard Employee Data
        </button>
      </div>
      <div className="sample-data-info">
        <p className="info-text">
          <strong>Messy Data:</strong> Contains combined fields (e.g., full name in one column, full address in one column), missing required fields, and inconsistent formats to test validation and data cleaning.
        </p>
        <p className="info-text">
          <strong>Standard Data:</strong> Clean, properly formatted data with all fields separated correctly and all required fields present.
        </p>
      </div>
    </div>
  );
}

