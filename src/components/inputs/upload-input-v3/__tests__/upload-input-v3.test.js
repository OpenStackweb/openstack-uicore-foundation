/**
 * Copyright 2018 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadInputV3 from '../index';

// Capture the latest dropzone props so tests can trigger callbacks
let dropzoneCallbacks = {};

jest.mock('../dropzone-v3', () => ({
  __esModule: true,
  DropzoneV3: function MockDropzoneV3(props) {
    dropzoneCallbacks = props;
    return <div className="dropzone-mock" data-upload-count={props.uploadCount}>{props.children}</div>;
  },
  default: function MockDropzoneV3(props) {
    dropzoneCallbacks = props;
    return <div className="dropzone-mock" data-upload-count={props.uploadCount}>{props.children}</div>;
  },
}));

describe('UploadInputV3', () => {
  const defaultProps = {
    value: [],
    postUrl: 'https://example.com/upload',
    id: 'test-upload',
    mediaType: {
      type: {
        allowed_extensions: ['pdf', 'jpg', 'png']
      },
      max_size: 10485760
    }
  };

  beforeEach(() => {
    dropzoneCallbacks = {};
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      const { container } = render(<UploadInputV3 {...defaultProps} />);
      expect(container.firstChild).not.toBeNull();
    });

    test('renders label when provided', () => {
      render(<UploadInputV3 {...defaultProps} label="Upload File" />);
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    test('renders helpText when provided', () => {
      const helpText = 'Please upload PDF, JPG or PNG files';
      render(<UploadInputV3 {...defaultProps} helpText={helpText} />);
      expect(screen.getByText(helpText)).toBeInTheDocument();
    });

    test('renders error message when error prop is provided', () => {
      const errorMessage = 'File upload failed';
      render(<UploadInputV3 {...defaultProps} error={errorMessage} />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    test('does not render label when not provided', () => {
      render(<UploadInputV3 {...defaultProps} />);
      expect(screen.queryByText('Upload File')).not.toBeInTheDocument();
    });

    test('shows alert when postUrl is not provided', () => {
      render(<UploadInputV3 {...defaultProps} postUrl={null} />);
      expect(screen.getByText('No Post URL')).toBeInTheDocument();
    });

    test('shows alert when canAdd is false', () => {
      render(<UploadInputV3 {...defaultProps} canAdd={false} />);
      expect(screen.getByText('Upload has been disabled by administrators.')).toBeInTheDocument();
    });
  });

  describe('File Display', () => {
    test('displays uploaded file with filename', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      render(<UploadInputV3 {...defaultProps} value={files} />);
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    test('displays multiple uploaded files', () => {
      const files = [
        { filename: 'document1.pdf', size: 102400 },
        { filename: 'document2.pdf', size: 204800 },
      ];
      render(<UploadInputV3 {...defaultProps} value={files} maxFiles={2} />);
      expect(screen.getByText('document1.pdf')).toBeInTheDocument();
      expect(screen.getByText('document2.pdf')).toBeInTheDocument();
    });

    test('shows Complete status for uploaded files', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      render(<UploadInputV3 {...defaultProps} value={files} />);
      expect(screen.getByText(/Complete/)).toBeInTheDocument();
    });

    test('shows default size when size is not provided', () => {
      const files = [{ filename: 'no-size.pdf' }];
      render(<UploadInputV3 {...defaultProps} value={files} />);
      expect(screen.getByText(/0 KB/)).toBeInTheDocument();
    });

    test('formats file size correctly', () => {
      const files = [{ filename: 'large-file.pdf', size: 2048000 }];
      render(<UploadInputV3 {...defaultProps} value={files} />);
      expect(screen.getByText(/2 MB/)).toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    test('shows delete button when onRemove and canDelete are provided', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      render(<UploadInputV3 {...defaultProps} value={files} onRemove={jest.fn()} canDelete={true} />);
      expect(screen.getAllByRole('button').length).toBe(1);
    });

    test('calls onRemove when delete button is clicked', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      const onRemoveMock = jest.fn();
      render(<UploadInputV3 {...defaultProps} value={files} onRemove={onRemoveMock} canDelete={true} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onRemoveMock).toHaveBeenCalledWith(files[0]);
    });

    test('does not show delete button when canDelete is false', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      render(<UploadInputV3 {...defaultProps} value={files} onRemove={jest.fn()} canDelete={false} />);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    test('does not show delete button when onRemove is not provided', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      render(<UploadInputV3 {...defaultProps} value={files} canDelete={true} />);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('Upload States', () => {
    test('shows dropzone when no file is uploading', () => {
      const { container } = render(<UploadInputV3 {...defaultProps} />);
      expect(container.querySelector('.dropzone-mock')).toBeInTheDocument();
    });

    test('hides dropzone while a file is uploading', () => {
      const { container } = render(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onAddedFile({ name: 'sample.png', size: 11264 });
      });
      expect(container.querySelector('.dropzone-mock')).not.toBeVisible();
    });

    test('shows Loading status and progress bar while uploading', () => {
      render(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onAddedFile({ name: 'sample.png', size: 11264 });
      });
      expect(screen.getByText('sample.png')).toBeInTheDocument();
      expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });

    test('shows Complete status and hides progress bar after upload finishes', () => {
      render(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onAddedFile({ name: 'sample.png', size: 11264 });
      });
      act(() => {
        dropzoneCallbacks.onFileCompleted({ name: 'sample.png', size: 11264 });
      });
      expect(screen.getByText(/Complete/)).toBeInTheDocument();
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });

    test('hides dropzone when max files reached', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      const { container } = render(<UploadInputV3 {...defaultProps} value={files} maxFiles={1} />);
      expect(container.querySelector('.dropzone-mock')).toBeNull();
    });

    test('shows dropzone when below max files', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      const { container } = render(<UploadInputV3 {...defaultProps} value={files} maxFiles={2} />);
      expect(container.querySelector('.dropzone-mock')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('shows error row with filename and message when a file error occurs', () => {
      render(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onAddedFile({ name: 'big-file.png', size: 9999999 });
      });
      act(() => {
        dropzoneCallbacks.onFileError(
          { name: 'big-file.png', size: 9999999 },
          'File is too big (9.54MiB). Max filesize: 5MiB.'
        );
      });
      expect(screen.getByText('big-file.png')).toBeInTheDocument();
      expect(screen.getByText('File is too big (9.54MiB). Max filesize: 5MiB.')).toBeInTheDocument();
    });

    test('removes the uploading row and shows error row when error occurs', () => {
      render(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onAddedFile({ name: 'big-file.png', size: 9999999 });
      });
      expect(screen.getByText(/Loading/)).toBeInTheDocument();

      act(() => {
        dropzoneCallbacks.onFileError(
          { name: 'big-file.png', size: 9999999 },
          'File is too big (9.54MiB). Max filesize: 5MiB.'
        );
      });
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
      expect(screen.getByText(/File is too big/)).toBeInTheDocument();
    });

    test('dismissing an error removes it from the view and restores the dropzone', () => {
      const { container } = render(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onFileError(
          { name: 'big-file.png', size: 9999999 },
          'File is too big (9.54MiB). Max filesize: 5MiB.'
        );
      });
      expect(screen.getByText(/File is too big/)).toBeInTheDocument();
      expect(container.querySelector('.dropzone-mock')).not.toBeVisible();

      act(() => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(screen.queryByText(/File is too big/)).not.toBeInTheDocument();
      expect(container.querySelector('.dropzone-mock')).toBeVisible();
    });

    test('hides dropzone when an error is present', () => {
      const { container } = render(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onFileError(
          { name: 'big-file.png', size: 9999999 },
          'File is too big (9.54MiB). Max filesize: 5MiB.'
        );
      });
      expect(container.querySelector('.dropzone-mock')).not.toBeVisible();
    });
  });

  describe('Configuration', () => {
    test('uses custom getAllowedExtensions function when provided', () => {
      const customGetExtensions = jest.fn(() => '.doc,.docx');
      render(<UploadInputV3 {...defaultProps} getAllowedExtensions={customGetExtensions} />);
      expect(customGetExtensions).toHaveBeenCalled();
    });

    test('uses custom getMaxSize function when provided', () => {
      const customGetMaxSize = jest.fn(() => 500);
      render(<UploadInputV3 {...defaultProps} getMaxSize={customGetMaxSize} />);
      expect(customGetMaxSize).toHaveBeenCalled();
    });

    test('shows dropzone and all files when below max files limit', () => {
      const files = [
        { filename: 'doc1.pdf', size: 102400 },
        { filename: 'doc2.pdf', size: 102400 },
      ];
      const { container } = render(<UploadInputV3 {...defaultProps} value={files} maxFiles={3} />);
      expect(container.querySelector('.dropzone-mock')).toBeInTheDocument();
      expect(screen.getByText('doc1.pdf')).toBeInTheDocument();
      expect(screen.getByText('doc2.pdf')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty value array', () => {
      const { container } = render(<UploadInputV3 {...defaultProps} value={[]} />);
      expect(container.querySelector('.dropzone-mock')).toBeInTheDocument();
    });

    test('handles mediaType without type property', () => {
      const { container } = render(<UploadInputV3 {...defaultProps} mediaType={{ max_size: 1024000 }} />);
      expect(container.querySelector('.dropzone-mock')).toBeInTheDocument();
    });

    test('handles missing mediaType', () => {
      const { container } = render(<UploadInputV3 value={[]} postUrl="https://example.com/upload" id="test" />);
      expect(container.querySelector('.dropzone-mock')).toBeInTheDocument();
    });

    test('handles undefined value prop', () => {
      const { container } = render(<UploadInputV3 postUrl="https://example.com/upload" id="test" mediaType={defaultProps.mediaType} />);
      expect(container.firstChild).not.toBeNull();
    });

    test('cleans up completed uploading file when value updates with server-renamed filename', () => {
      const { rerender } = render(<UploadInputV3 {...defaultProps} value={[]} maxFiles={1} />);

      // Simulate file added
      act(() => {
        dropzoneCallbacks.onAddedFile({ name: 'image.png', size: 75000 });
      });

      // Simulate file completed
      act(() => {
        dropzoneCallbacks.onFileCompleted({ name: 'image.png', size: 75000 });
      });

      // Parent updates value with server-renamed file
      rerender(<UploadInputV3 {...defaultProps} value={[{ filename: 'image_abc123.png', size: 75000 }]} maxFiles={1} />);

      // Assert: only the server-renamed file is visible
      expect(screen.getByText('image_abc123.png')).toBeInTheDocument();
      expect(screen.queryByText('image.png')).not.toBeInTheDocument();
    });
  });
});
