# Payroll Distribution Engine (Demo)

This project is a high-fidelity simulation of an onboarding platform's (like Onboarded) core integration engine. It demonstrates the "one-to-many" transformation logic required to take a single, complex "source of truth" new-hire file and distribute that data to multiple downstream payroll providers (e.g., ADP, QuickBooks), each with its own unique file format, data schema, and business logic.

This was built using **Node.js**, **React**, **TypeScript**, and **Vite** to demonstrate advanced domain expertise in payroll, benefits, and compliance integrations.

---

## Core Features Demonstrated

### 1. Complex Data Mapping

- Takes a single 48-column "master" CSV and transforms it into two completely different provider-specific schemas.
- Handles data transformations (e.g., `annual_salary` to `per_paycheck_rate`).
- Handles code mapping (e.g., `Married` → `M` for ADP, but `Married` → `married_filing_jointly` for QuickBooks).
- Handles complex field combinations (e.g., creating a single "Home Address" string).

### 2. Full-Scope Payroll Data

This isn't just `first_name` and `last_name`. The data model includes the real-world complexity of a new hire:

- **Identity & Tax:** SSN, DOB, Home Address, and Work Address (for tax reciprocity).
- **Compensation:** FLSA Status (Exempt/Non-Exempt), Salary, and Pay Frequency.
- **Payment:** Split Direct Deposit (percent _or_ flat amount).
- **Deductions (All 4 Types):**
  1. **Benefits:** Health plan and per-paycheck cost.
  2. **Retirement:** 401(k) percentage _and_ separate 401(k) loan repayments.
  3. **Mandatory:** Legally-mandated garnishments (e.g., Child Support).
- **Compliance:** EEO-1 data (Gender/Ethnicity).

### 3. Compliance Gating (I-9 / E-Verify)

The engine acts as a critical compliance gate. It reads the `i9_status` and `e_verify_status` fields _first_. Employees who are not yet work-authorized (e.g., "Pending_Section_2") are filtered out and skipped, preventing them from being pushed to downstream payroll systems prematurely.

### 4. Intelligent Data Processing

- **Messy Data Handling:** Automatically parses combined fields (e.g., single address field split into street/city/state/zip).
- **Real-time Progress:** Shows processing progress with detailed logs.
- **Error Tracking:** Comprehensive error tracking with traceability and correction capabilities.

### 5. Admin-Friendly Configuration

- **Mapping Editor:** Visual interface to configure field mappings for different providers.
- **Error Correction:** UI for correcting validation errors with full audit trail.
- **Template Downloads:** Downloadable templates and documentation for the standard format.

---

## Architecture

### Client-Side Processing

All processing happens in the browser using client-side libraries:

- **CSV Parsing:** `papaparse` for client-side CSV parsing
- **State Management:** React hooks with Context API
- **Real-time Updates:** React state updates with async processing
- **Storage:** localStorage for mapping configurations and error tracking

### API-Ready Structure

The codebase is structured to easily migrate to a REST API:

- **Services:** Pure business logic functions (can move to server)
- **Controllers:** Request handlers (can become Express routes)
- **API Routes:** Interface layer (can switch to HTTP calls)
- **Components:** React UI (minimal changes needed)

---

## How to Run

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

   ```bash
   git clone [your-repo-url]
   cd payroll-distribution-engine
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

---

## Usage Guide

### 1. Upload CSV File

1. Click on the **Upload CSV** tab
2. Download the input template to see the required format
3. Upload your `onboarded_new_hires.csv` file (drag-and-drop or click to browse)
4. Preview of the first 5 rows will be shown

### 2. Process Payroll

1. Click on the **Process Payroll** tab
2. Click the **Process Payroll** button
3. Watch real-time progress and logs
4. Review any warnings or errors
5. Download the output files:
   - **Download ADP CSV** - Provider-specific format for ADP
   - **Download QuickBooks CSV** - Provider-specific format for QuickBooks

### 3. Error Correction

If errors are found:

1. Review the error table in the **Error Correction** section
2. Enter corrected values for each error
3. Add optional notes for traceability
4. Click **Apply** to save the correction
5. Re-process the file after corrections

### 4. Mapping Configuration

1. Click on the **Mapping Configuration** tab
2. Select a provider (ADP or QuickBooks)
3. View and edit field mappings
4. Save changes or reset to defaults
5. Export/import mapping configurations as JSON

---

## File Structure

```
payroll-distribution-engine/
├── src/
│   ├── components/          # React UI components
│   ├── api/                 # API interface layer
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic
│   ├── config/              # Configuration files
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Utility functions
│   ├── hooks/               # React hooks
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── data_input/              # Sample input files
├── package.json
├── vite.config.ts
└── README.md
```

---

## Standard Input Format

The engine expects a CSV file with 48 columns following this format:

| Field       | Type   | Required | Description                          |
| ----------- | ------ | -------- | ------------------------------------ |
| employee_id | string | Yes      | Unique employee identifier           |
| first_name  | string | Yes      | Employee first name                  |
| last_name   | string | Yes      | Employee last name                   |
| dob         | date   | Yes      | Date of birth (YYYY-MM-DD)           |
| ssn         | string | Yes      | Social Security Number (XXX-XX-XXXX) |
| home_street | string | Yes      | Home address street                  |
| home_city   | string | Yes      | Home address city                    |
| home_state  | string | Yes      | Home address state (2-letter code)   |
| home_zip    | string | Yes      | Home address ZIP code                |
| ...         | ...    | ...      | ... (see field specification CSV)    |

**Download the field specification CSV** from the Upload tab to see all 48 fields with validation rules, options, and notes.

---

## Output Formats

### ADP Format

The ADP output includes:

- Employee identification fields
- Address information (home and work)
- Tax information (federal, state, local)
- Direct deposit configuration
- Deductions (Health, Retirement, Loan, Garnishment)

### QuickBooks Format

The QuickBooks output includes:

- Combined fields (e.g., "Full Name", "Home Address")
- Human-readable formats
- Compliance information (I-9, E-Verify)
- EEO-1 data (Gender, Ethnicity)

---

## Error Handling

### Error Types

- **REQUIRED_FIELD_MISSING:** A required field is empty
- **INVALID_FORMAT:** Field value doesn't match expected format
- **VALIDATION_ERROR:** Field value fails validation rules
- **BUSINESS_LOGIC_ERROR:** Business rule violation (e.g., split percentages don't sum to 100)
- **COMPLIANCE_GATE_FAILED:** Employee not ready for payroll (I-9/E-Verify not complete)

### Error Correction

All errors include:

- **Traceability:** Row number, field name, original value
- **Error Type:** Classification of the error
- **Suggested Fix:** Recommended correction
- **Correction History:** Full audit trail of corrections

---

## Code Quality

This project follows best practices:

- **TypeScript:** Strict mode enabled with comprehensive type definitions
- **Clean Code:** Descriptive naming, single responsibility, DRY principle
- **Documentation:** JSDoc comments for complex functions
- **Error Handling:** Clear, actionable error messages
- **Separation of Concerns:** Pure functions in services, UI logic in components

---

## Migration Path to REST API

When ready to migrate to a REST API:

1. Move `src/services/*.ts` → `server/services/*.js`
2. Create Express routes that call these services
3. Replace `useProcessing` hook with API calls
4. Replace localStorage with database
5. Add Socket.io for real-time updates
6. Keep React components mostly unchanged (just update data fetching)

---

## Sample Data

A sample input file is included in `data_input/onboarded_new_hires.csv` with three employees:

- **Employee 1001:** Fully compliant, ready for payroll
- **Employee 1002:** Fully compliant, ready for payroll
- **Employee 1003:** Not compliant (I-9 pending), will be skipped

---

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **PapaParse** - CSV parsing
- **LocalStorage** - Client-side persistence

---

## Future Enhancements

- [ ] Database persistence for mappings and errors
- [ ] REST API backend
- [ ] Real-time WebSocket updates
- [ ] Additional provider formats
- [ ] Batch processing capabilities
- [ ] Advanced reporting and analytics

---

## License

This is a demo project for portfolio/job interview purposes.

---

## Author

Built to demonstrate expertise in:

- Payroll and benefits integration
- Data transformation and mapping
- Compliance and validation
- Full-stack development
- Clean, maintainable code architecture
