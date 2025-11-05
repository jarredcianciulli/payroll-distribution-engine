/**
 * Template Download Component
 * Provides buttons to download templates and documentation
 */

import { templates as templatesApi } from '../api';

export function TemplateDownload() {
  const handleDownloadTemplate = () => {
    templatesApi.downloadTemplate();
  };

  const handleDownloadDocumentation = () => {
    templatesApi.downloadDocumentation();
  };

  const handleDownloadSpecification = () => {
    templatesApi.downloadSpecification();
  };

  return (
    <div className="template-download">
      <p className="help-text">
        Download the SFTP Export Engine standardized format templates and documentation to understand the required file structure, field specifications, and data formats.
      </p>
      <div className="button-group">
        <button onClick={handleDownloadTemplate} className="btn btn-primary">
          Employee upload template
        </button>
        <button onClick={handleDownloadDocumentation} className="btn btn-secondary">
          Employee upload specifications
        </button>
        <button onClick={handleDownloadSpecification} className="btn btn-secondary">
          SFTP File Specifications
        </button>
      </div>
    </div>
  );
}

