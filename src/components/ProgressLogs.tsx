/**
 * Progress Logs Component
 * Displays real-time processing logs with color coding
 */

import { exportToCSV } from '../utils/csvWriter';
import type { ProcessingLog, LogLevel } from '../types';
import { IoCheckmarkCircle, IoCloseCircle, IoWarning, IoInformationCircle } from 'react-icons/io5';

interface ProgressLogsProps {
  logs: ProcessingLog[];
  filter?: LogLevel;
}

export function ProgressLogs({ logs, filter }: ProgressLogsProps) {
  const filteredLogs = filter ? logs.filter(log => log.level === filter) : logs;

  const getLogColor = (level: LogLevel): string => {
    switch (level) {
      case 'ERROR':
        return '#dc3545';
      case 'WARNING':
        return '#ffc107';
      case 'SUCCESS':
        return '#28a745';
      case 'INFO':
      default:
        return '#6c757d';
    }
  };

  const getLogIcon = (level: LogLevel) => {
    switch (level) {
      case 'ERROR':
        return <IoCloseCircle style={{ fontSize: '1rem', marginRight: '0.5rem' }} />;
      case 'WARNING':
        return <IoWarning style={{ fontSize: '1rem', marginRight: '0.5rem' }} />;
      case 'SUCCESS':
        return <IoCheckmarkCircle style={{ fontSize: '1rem', marginRight: '0.5rem' }} />;
      case 'INFO':
      default:
        return <IoInformationCircle style={{ fontSize: '1rem', marginRight: '0.5rem' }} />;
    }
  };

  const getLogBadge = (level: LogLevel): string => {
    switch (level) {
      case 'ERROR':
        return 'ERROR';
      case 'WARNING':
        return 'WARNING';
      case 'SUCCESS':
        return 'SUCCESS';
      case 'INFO':
      default:
        return 'INFO';
    }
  };

  const handleDownloadLogs = () => {
    const logRows = filteredLogs.map(log => ({
      timestamp: new Date(log.timestamp).toLocaleString(),
      level: log.level,
      message: log.message,
      employee_id: log.employeeId || '',
      row: log.row || ''
    }));

    const headers = ['timestamp', 'level', 'message', 'employee_id', 'row'];
    exportToCSV(logRows, 'processing_logs.csv', headers);
  };

  return (
    <div className="progress-logs">
      <div className="logs-header">
        <h4>Processing Logs</h4>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="log-count">
            {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
          </div>
          {filteredLogs.length > 0 && (
            <button 
              onClick={handleDownloadLogs} 
              className="btn btn-secondary btn-sm"
            >
              Download Logs CSV
            </button>
          )}
        </div>
      </div>
      <div className="logs-container">
        {filteredLogs.length === 0 ? (
          <p className="no-logs">No logs to display</p>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={`${log.id}_${index}_${log.timestamp}`}
              className="log-entry"
            >
              <div className="log-header">
                <span style={{ color: getLogColor(log.level) }}>
                  {getLogIcon(log.level)}
                </span>
                <span className="log-level" style={{ color: getLogColor(log.level) }}>
                  {getLogBadge(log.level)}
                </span>
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                {log.row && (
                  <span className="log-row">Row: {log.row}</span>
                )}
              </div>
              <div className="log-message">{log.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

