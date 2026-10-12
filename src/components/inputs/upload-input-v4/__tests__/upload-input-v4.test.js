/**
 * Copyright 2026 OpenStack Foundation
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

import '../__fixtures__/jsdom-polyfills';
import React from 'react';
import { render, screen, act, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createFakeFileApi, deferred } from '../__fixtures__/fake-file-api';
import UploadInputV4 from '../index';

jest.mock('../../../security/methods', () => ({
  getAccessToken: jest.fn(() => Promise.resolve('token')),
  initLogOut: jest.fn(),
}));

jest.mock('../../../../utils/crypto', () => ({
  getMD5: jest.fn((file) => Promise.resolve(`md5-${file.name}`)),
}));

jest.mock('i18n-react/dist/i18n-react', () => {
  const en = require('../../../../i18n/en.json');
  return {
    __esModule: true,
    default: {
      translate: (key) => {
        const value = key.split('.').reduce((obj, part) => obj?.[part], en);
        return value ?? key;
      }
    }
  };
});

const BASE = 'https://files.test/api/v1/files';

const fileOf = (name, size, type) => new File([new Uint8Array(size)], name, { type, lastModified: 1 });
const fileInput = (container) => container.querySelector('input[type="file"]');
const dropArea = (container) => container.querySelector('.dropzone');
const select = (container, ...files) => act(() => {
  fireEvent.change(fileInput(container), { target: { files } });
});
const holdPuts = () => {
  const put = deferred();
  api.respond('PUT', /bucket\.test/, () => put.promise);
  return put;
};

let api;

describe('UploadInputV4', () => {
  const defaultProps = {
    value: [],
    postUrl: BASE,
    id: 'test-upload',
    mediaType: {
      type: {
        allowed_extensions: ['pdf', 'jpg', 'png']
      },
      max_size: 10485760
    }
  };

  beforeEach(() => {
    api = createFakeFileApi(BASE);
    api.install();
    URL.createObjectURL = jest.fn(file => `blob:${file.name}`);
    URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    cleanup();
    api.uninstall();
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      expect(container.firstChild).not.toBeNull();
    });

    test('renders label when provided', () => {
      render(<UploadInputV4 {...defaultProps} label="Upload File" />);
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    test('renders helpText when provided', () => {
      const helpText = 'Please upload PDF, JPG or PNG files';
      render(<UploadInputV4 {...defaultProps} helpText={helpText} />);
      expect(screen.getByText(helpText)).toBeInTheDocument();
    });

    test('renders error message when error prop is provided', () => {
      render(<UploadInputV4 {...defaultProps} error="File upload failed" />);
      expect(screen.getByText('File upload failed')).toBeInTheDocument();
    });

    test('does not render label when not provided', () => {
      render(<UploadInputV4 {...defaultProps} />);
      expect(screen.queryByText('Upload File')).not.toBeInTheDocument();
    });

    test('shows alert and no file input when postUrl is not provided', () => {
      const { container } = render(<UploadInputV4 {...defaultProps} postUrl={null} />);
      expect(screen.getByText('No Post URL')).toBeInTheDocument();
      expect(fileInput(container)).toBeNull();
    });

    test('shows alert when canAdd is false', () => {
      render(<UploadInputV4 {...defaultProps} canAdd={false} />);
      expect(screen.getByText('Upload has been disabled by administrators.')).toBeInTheDocument();
    });

    test('the file input accepts the allowed extensions, and several files only when maxFiles > 1', () => {
      const { container, rerender } = render(<UploadInputV4 {...defaultProps} />);
      expect(fileInput(container)).toHaveAttribute('accept', '.pdf,.jpg,.png');
      expect(fileInput(container)).not.toHaveAttribute('multiple');
      rerender(<UploadInputV4 {...defaultProps} maxFiles={3} />);
      expect(fileInput(container)).toHaveAttribute('multiple');
    });
  });

  describe('File Display', () => {
    test('displays uploaded file with filename', () => {
      render(<UploadInputV4 {...defaultProps} value={[{ filename: 'document.pdf', size: 102400 }]} />);
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    test('displays multiple uploaded files', () => {
      const files = [
        { filename: 'document1.pdf', size: 102400 },
        { filename: 'document2.pdf', size: 204800 },
      ];
      render(<UploadInputV4 {...defaultProps} value={files} maxFiles={2} />);
      expect(screen.getByText('document1.pdf')).toBeInTheDocument();
      expect(screen.getByText('document2.pdf')).toBeInTheDocument();
    });

    test('shows Complete status for uploaded files', () => {
      render(<UploadInputV4 {...defaultProps} value={[{ filename: 'document.pdf', size: 102400 }]} />);
      expect(screen.getByText(/Complete/)).toBeInTheDocument();
    });

    test('does not show file size when size is not provided', () => {
      render(<UploadInputV4 {...defaultProps} value={[{ filename: 'no-size.pdf' }]} />);
      expect(screen.queryByText(/KB|MB/)).not.toBeInTheDocument();
      expect(screen.getByText(/Complete/)).toBeInTheDocument();
    });

    test('formats file size correctly', () => {
      render(<UploadInputV4 {...defaultProps} value={[{ filename: 'large-file.pdf', size: 2048000 }]} />);
      expect(screen.getByText(/2 MB/)).toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    const files = [{ filename: 'document.pdf', size: 102400 }];

    test('shows delete button when onRemove and canDelete are provided', () => {
      render(<UploadInputV4 {...defaultProps} value={files} onRemove={jest.fn()} canDelete={true} />);
      expect(screen.getAllByRole('button').length).toBe(1);
    });

    test('calls onRemove when delete button is clicked', () => {
      const onRemove = jest.fn();
      render(<UploadInputV4 {...defaultProps} value={files} onRemove={onRemove} canDelete={true} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onRemove).toHaveBeenCalledWith(files[0]);
    });

    test('does not show delete button when canDelete is false', () => {
      render(<UploadInputV4 {...defaultProps} value={files} onRemove={jest.fn()} canDelete={false} />);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    test('does not show delete button when onRemove is not provided', () => {
      render(<UploadInputV4 {...defaultProps} value={files} canDelete={true} />);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('Upload States', () => {
    test('shows the drop area when nothing is uploading', () => {
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      expect(dropArea(container)).toBeVisible();
    });

    test('shows the file as Uploading and hides the drop area while it uploads', async () => {
      holdPuts();
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      select(container, fileOf('sample.png', 11264, 'image/png'));
      await waitFor(() => expect(api.puts()).toHaveLength(1));
      expect(screen.getByText('sample.png')).toBeInTheDocument();
      expect(screen.getByText(/Uploading/)).toBeInTheDocument();
      expect(dropArea(container)).not.toBeVisible();
    });

    test('calls onUploadStart with the selected File', async () => {
      const onUploadStart = jest.fn();
      const { container } = render(<UploadInputV4 {...defaultProps} onUploadStart={onUploadStart} />);
      const file = fileOf('doc.pdf', 2048, 'application/pdf');
      select(container, file);
      expect(onUploadStart).toHaveBeenCalledWith(file);
    });

    test('delivers the file API body unmodified to onUploadComplete with the input id and data, then shows Complete', async () => {
      const onUploadComplete = jest.fn();
      const { container } = render(<UploadInputV4 {...defaultProps} onUploadComplete={onUploadComplete} />);
      select(container, fileOf('doc.pdf', 2048, 'application/pdf'));
      await waitFor(() => expect(onUploadComplete).toHaveBeenCalledTimes(1));

      const [body, inputId, data] = onUploadComplete.mock.calls[0];
      expect(body).toBe(api.calls('POST', /\/complete$/)[0].response);
      expect(inputId).toBe('test-upload');
      expect(data).toEqual({ media_type: defaultProps.mediaType, media_upload: [] });
      expect(screen.getByText(/Complete/)).toBeInTheDocument();
      expect(screen.queryByText(/Uploading/)).not.toBeInTheDocument();
    });

    test('dropping files on the drop area uploads them', async () => {
      const onUploadComplete = jest.fn();
      const { container } = render(<UploadInputV4 {...defaultProps} onUploadComplete={onUploadComplete} />);
      act(() => {
        fireEvent.drop(dropArea(container), { dataTransfer: { files: [fileOf('doc.pdf', 2048, 'application/pdf')] } });
      });
      await waitFor(() => expect(onUploadComplete).toHaveBeenCalledTimes(1));
    });

    test('hides the drop area when max files reached', () => {
      const { container } = render(<UploadInputV4 {...defaultProps} value={[{ filename: 'document.pdf', size: 102400 }]} maxFiles={1} />);
      expect(dropArea(container)).toBeNull();
    });

    test('shows the drop area when below max files', () => {
      const { container } = render(<UploadInputV4 {...defaultProps} value={[{ filename: 'document.pdf', size: 102400 }]} maxFiles={2} />);
      expect(dropArea(container)).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    test('a file API rejection shows an error row with the server message and calls onError', async () => {
      api.respond('POST', /^\/uploads\/single$/, () => api.reply(412, { message: 'File type not allowed' }));
      const onError = jest.fn();
      const { container } = render(<UploadInputV4 {...defaultProps} onError={onError} />);
      select(container, fileOf('video.png', 2048, 'image/png'));

      expect(await screen.findByText('File type not allowed')).toBeInTheDocument();
      expect(screen.getByText('video.png')).toBeInTheDocument();
      expect(screen.queryByText(/Uploading/)).not.toBeInTheDocument();
      expect(onError).toHaveBeenCalledWith(expect.any(Error), 412, 'test-upload');
      expect(api.puts()).toHaveLength(0);
    });

    test('a connection failure during the PUT shows the readable network message', async () => {
      api.respond('PUT', /bucket\.test/, () => api.networkError());
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      select(container, fileOf('video.png', 2048, 'image/png'));
      expect(await screen.findByText('Upload interrupted by a connection error. Please retry.')).toBeInTheDocument();
    });

    test('a zero-byte file shows the file API rejection and sends no PUT', async () => {
      api.respond('POST', /^\/uploads\/single$/, () => api.reply(412, { message: 'size must be positive' }), {
        when: (req) => req.body.size === 0,
      });
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      select(container, fileOf('empty.pdf', 0, 'application/pdf'));
      expect(await screen.findByText('size must be positive')).toBeInTheDocument();
      expect(api.puts()).toHaveLength(0);
    });

    test('cancelling an upload from its row removes it without an error row and purges its ticket', async () => {
      holdPuts();
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      select(container, fileOf('sample.png', 11264, 'image/png'));
      await waitFor(() => expect(api.puts()).toHaveLength(1));

      // The delete button on the uploading row is the only visible button.
      act(() => { fireEvent.click(screen.getByRole('button')); });

      await waitFor(() => expect(api.calls('DELETE', /.*/).map(r => r.path)).toEqual(['/uploads/t1']));
      expect(screen.queryByText('sample.png')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Retry')).not.toBeInTheDocument();
      expect(dropArea(container)).toBeVisible();
    });

    test('dismissing an error removes it, restores the drop area, and purges the stored upload', async () => {
      api.respond('PUT', /bucket\.test/, () => api.networkError());
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      select(container, fileOf('video.png', 2048, 'image/png'));
      await screen.findByTitle('Retry');
      expect(dropArea(container)).not.toBeVisible();

      // The error row has two buttons (Retry, then dismiss); dismiss is last.
      const errorRowButtons = screen.getAllByRole('button');
      act(() => { fireEvent.click(errorRowButtons[errorRowButtons.length - 1]); });

      expect(screen.queryByText('video.png')).not.toBeInTheDocument();
      expect(dropArea(container)).toBeVisible();
      await waitFor(() => expect(api.calls('DELETE', /.*/).map(r => r.path)).toEqual(['/uploads/t1']));
    });

    test('retry uploads a failed file again and delivers it', async () => {
      api.respond('PUT', /bucket\.test/, () => api.networkError(), { times: 1 });
      const onUploadComplete = jest.fn();
      const { container } = render(<UploadInputV4 {...defaultProps} onUploadComplete={onUploadComplete} />);
      select(container, fileOf('video.png', 2048, 'image/png'));

      await screen.findByTitle('Retry');
      act(() => { fireEvent.click(screen.getByTitle('Retry')); });
      await waitFor(() => expect(onUploadComplete).toHaveBeenCalledTimes(1));
      expect(api.puts()).toHaveLength(2);
      expect(screen.getByText(/Complete/)).toBeInTheDocument();
    });

    test('retry calls onUploadStart again, as V3 did', async () => {
      api.respond('PUT', /bucket\.test/, () => api.networkError(), { times: 1 });
      const onUploadStart = jest.fn();
      const { container } = render(<UploadInputV4 {...defaultProps} onUploadStart={onUploadStart} />);
      const file = fileOf('video.png', 2048, 'image/png');
      select(container, file);

      await screen.findByTitle('Retry');
      act(() => { fireEvent.click(screen.getByTitle('Retry')); });

      expect(onUploadStart).toHaveBeenCalledTimes(2);
      expect(onUploadStart).toHaveBeenLastCalledWith(file);
    });

    test('a file API error with no message shows the translated upload failure', async () => {
      api.respond('POST', /^\/uploads\/single$/, () => api.reply(503));
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      select(container, fileOf('video.png', 2048, 'image/png'));

      expect(await screen.findByText('Upload failed. Please retry.')).toBeInTheDocument();
      expect(screen.queryByText(/HTTP 503/)).not.toBeInTheDocument();
    });

    test('retrying a file Uppy never took only clears its row', async () => {
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      select(container, fileOf('tool.exe', 2048, 'application/octet-stream'));
      act(() => { fireEvent.click(screen.getByTitle('Retry')); });

      expect(screen.queryByText('tool.exe')).not.toBeInTheDocument();
      expect(api.requests).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    test('uses custom getAllowedExtensions function when provided', () => {
      const customGetExtensions = jest.fn(() => '.doc,.docx');
      render(<UploadInputV4 {...defaultProps} getAllowedExtensions={customGetExtensions} />);
      expect(customGetExtensions).toHaveBeenCalled();
    });

    test('uses custom getMaxSize function when provided', () => {
      const customGetMaxSize = jest.fn(() => 500);
      render(<UploadInputV4 {...defaultProps} getMaxSize={customGetMaxSize} />);
      expect(customGetMaxSize).toHaveBeenCalled();
    });

    test('rejects a file with a disallowed extension before any request', () => {
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      select(container, fileOf('tool.exe', 2048, 'application/octet-stream'));
      expect(screen.getByText('You can only upload: .pdf, .jpg, .png')).toBeInTheDocument();
      expect(api.requests).toHaveLength(0);
    });

    test('rejects a file over the max size before any request', () => {
      const { container } = render(<UploadInputV4 {...defaultProps} getMaxSize={() => 1} />);
      select(container, fileOf('big.pdf', 2 * 1024 * 1024, 'application/pdf'));
      expect(screen.getByText(/exceeds maximum allowed size/)).toBeInTheDocument();
      expect(api.requests).toHaveLength(0);
    });

    test('shows drop area and all files when below max files limit', () => {
      const files = [
        { filename: 'doc1.pdf', size: 102400 },
        { filename: 'doc2.pdf', size: 102400 },
      ];
      const { container } = render(<UploadInputV4 {...defaultProps} value={files} maxFiles={3} />);
      expect(dropArea(container)).toBeVisible();
      expect(screen.getByText('doc1.pdf')).toBeInTheDocument();
      expect(screen.getByText('doc2.pdf')).toBeInTheDocument();
    });

    test('accepts the Dropzone-only props and warns about djsConfig once', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => { });
      const legacy = { djsConfig: { withCredentials: true }, parallelChunkUploads: true, maxConcurrentChunks: 3, timeOut: 1000 };
      render(<UploadInputV4 {...defaultProps} {...legacy} />);
      render(<UploadInputV4 {...defaultProps} {...legacy} id="second" />);
      expect(warn).toHaveBeenCalledTimes(1);
      warn.mockRestore();
    });
  });

  describe('File Preview and Download', () => {
    test('renders a preview image linked to the file', () => {
      const files = [{ filename: 'image.png', size: 102400, public_url: 'https://cdn.example.com/image.png' }];
      render(<UploadInputV4 {...defaultProps} value={files} />);
      const previewLink = screen.getByRole('img', { name: 'image.png' }).closest('a');
      expect(previewLink).toHaveAttribute('href', 'https://cdn.example.com/image.png');
      expect(previewLink).toHaveAttribute('target', '_blank');
      expect(previewLink).not.toHaveAttribute('download');
    });

    test('prefers private_url and falls back to public_url when private_url is "#"', () => {
      const { rerender, container } = render(<UploadInputV4 {...defaultProps} value={[{
        filename: 'a.png', size: 1024,
        private_url: 'https://private.example.com/a.png',
        public_url: 'https://cdn.example.com/a.png',
      }]} />);
      expect(container.querySelector('a[download]')).toHaveAttribute('href', 'https://private.example.com/a.png');

      rerender(<UploadInputV4 {...defaultProps} value={[{
        filename: 'a.png', size: 1024,
        private_url: '#',
        public_url: 'https://cdn.example.com/a.png',
      }]} />);
      expect(container.querySelector('a[download]')).toHaveAttribute('href', 'https://cdn.example.com/a.png');
    });

    test('filename is a download link with correct href', () => {
      const files = [{ filename: 'document.pdf', size: 102400, public_url: 'https://cdn.example.com/document.pdf' }];
      const { container } = render(<UploadInputV4 {...defaultProps} value={files} />);
      const downloadLink = container.querySelector('a[download]');
      expect(downloadLink).toHaveAttribute('href', 'https://cdn.example.com/document.pdf');
      expect(downloadLink).toHaveAttribute('target', '_blank');
      expect(downloadLink).toHaveTextContent('document.pdf');
    });

    test('preview image falls back to file_icon on load error', () => {
      const files = [{ filename: 'document.pdf', size: 102400, public_url: 'https://cdn.example.com/document.pdf' }];
      render(<UploadInputV4 {...defaultProps} value={files} />);
      const img = screen.getByRole('img', { name: 'document.pdf' });
      fireEvent.error(img);
      expect(img).not.toHaveAttribute('src', 'https://cdn.example.com/document.pdf');
    });
  });

  describe('Image Preview', () => {
    test('shows a preview as soon as an image is selected', async () => {
      holdPuts();
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      select(container, fileOf('photo.jpg', 136000, 'image/jpeg'));
      expect(screen.getByRole('img', { name: 'photo.jpg' })).toHaveAttribute('src', 'blob:photo.jpg');
    });

    test('shows no preview for non-image files', () => {
      holdPuts();
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      select(container, fileOf('document.pdf', 50000, 'application/pdf'));
      expect(screen.queryByRole('img', { name: 'document.pdf' })).not.toBeInTheDocument();
    });

    test('keeps the blob preview after value confirms the delivered file', async () => {
      const onUploadComplete = jest.fn();
      const { container, rerender } = render(<UploadInputV4 {...defaultProps} onUploadComplete={onUploadComplete} />);
      select(container, fileOf('photo.jpg', 136000, 'image/jpeg'));
      await waitFor(() => expect(onUploadComplete).toHaveBeenCalledTimes(1));
      const [body] = onUploadComplete.mock.calls[0];

      rerender(<UploadInputV4 {...defaultProps} onUploadComplete={onUploadComplete} value={[{ filename: body.name, size: body.size }]} />);

      expect(screen.getByRole('img', { name: body.name })).toHaveAttribute('src', 'blob:photo.jpg');
    });

    test('revokes the blob URL when an upload is cancelled', async () => {
      holdPuts();
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      select(container, fileOf('photo-a.jpg', 10000, 'image/jpeg'));
      await waitFor(() => expect(api.puts()).toHaveLength(1));
      act(() => { fireEvent.click(screen.getByRole('button')); });
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo-a.jpg');
    });

    test('revokes the blob URL when an upload fails', async () => {
      api.respond('PUT', /bucket\.test/, () => api.networkError());
      const { container } = render(<UploadInputV4 {...defaultProps} />);
      select(container, fileOf('photo-a.jpg', 10000, 'image/jpeg'));
      await screen.findByTitle('Retry');
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo-a.jpg');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty value array', () => {
      const { container } = render(<UploadInputV4 {...defaultProps} value={[]} />);
      expect(dropArea(container)).toBeInTheDocument();
    });

    test('handles mediaType without type property', () => {
      const { container } = render(<UploadInputV4 {...defaultProps} mediaType={{ max_size: 1024000 }} />);
      expect(dropArea(container)).toBeInTheDocument();
    });

    test('handles missing mediaType', () => {
      const { container } = render(<UploadInputV4 value={[]} postUrl={BASE} id="test" />);
      expect(dropArea(container)).toBeInTheDocument();
    });

    test('handles undefined value prop', () => {
      const { container } = render(<UploadInputV4 postUrl={BASE} id="test" mediaType={defaultProps.mediaType} />);
      expect(container.firstChild).not.toBeNull();
    });

    test('clears a delivered row once value confirms it', async () => {
      const onUploadComplete = jest.fn();
      const { container, rerender } = render(<UploadInputV4 {...defaultProps} onUploadComplete={onUploadComplete} />);
      select(container, fileOf('image.png', 75000, 'image/png'));
      await waitFor(() => expect(onUploadComplete).toHaveBeenCalledTimes(1));

      rerender(<UploadInputV4 {...defaultProps} onUploadComplete={onUploadComplete} value={[{ filename: 'image.png', size: 75000 }]} />);

      expect(screen.getAllByText('image.png')).toHaveLength(1);
      expect(screen.queryByText(/Uploading/)).not.toBeInTheDocument();
    });

    test('completing one file does not mark another in-flight file complete', async () => {
      const held = deferred();
      api.respond('PUT', /file-b\.png$/, () => held.promise);
      const onUploadComplete = jest.fn();
      const { container } = render(<UploadInputV4 {...defaultProps} maxFiles={3} onUploadComplete={onUploadComplete} />);
      select(container, fileOf('file-a.png', 10000, 'image/png'), fileOf('file-b.png', 20000, 'image/png'));
      await waitFor(() => expect(onUploadComplete).toHaveBeenCalledTimes(1));

      expect(onUploadComplete.mock.calls[0][0].original_name).toBe('file-a.png');
      expect(screen.getByText('file-b.png')).toBeInTheDocument();
      expect(screen.getAllByText(/Uploading/)).toHaveLength(1);
    });

    test('picking the same file again after the parent removed it uploads it again', async () => {
      const onUploadComplete = jest.fn();
      const file = fileOf('doc.pdf', 2048, 'application/pdf');
      const { container, rerender } = render(<UploadInputV4 {...defaultProps} onUploadComplete={onUploadComplete} />);
      select(container, file);
      await waitFor(() => expect(onUploadComplete).toHaveBeenCalledTimes(1));
      rerender(<UploadInputV4 {...defaultProps} onUploadComplete={onUploadComplete} value={[{ filename: 'doc.pdf', size: 2048 }]} />);
      rerender(<UploadInputV4 {...defaultProps} onUploadComplete={onUploadComplete} value={[]} />);

      select(container, file);
      await waitFor(() => expect(onUploadComplete).toHaveBeenCalledTimes(2));
      expect(api.calls('POST', /^\/uploads\/single$/)).toHaveLength(2);
      expect(screen.queryByTitle('Retry')).not.toBeInTheDocument();
      expect(api.calls('DELETE', /.*/)).toHaveLength(0);
    });

    test('selecting more files than the remaining slots uploads the first and rejects the rest', async () => {
      const onUploadComplete = jest.fn();
      const { container } = render(<UploadInputV4 {...defaultProps} maxFiles={2} value={[{ filename: 'existing.pdf', size: 100 }]} onUploadComplete={onUploadComplete} />);
      select(container, fileOf('one.pdf', 2048, 'application/pdf'), fileOf('two.pdf', 2048, 'application/pdf'));

      expect(screen.getByText('Maximum number of files reached.')).toBeInTheDocument();
      await waitFor(() => expect(onUploadComplete).toHaveBeenCalledTimes(1));
      expect(onUploadComplete.mock.calls[0][0].original_name).toBe('one.pdf');
      expect(api.calls('POST', /^\/uploads\/single$/)).toHaveLength(1);
    });

    test('unmounting mid-upload purges the ticket, never delivers, and logs no React warning', async () => {
      holdPuts();
      const consoleError = jest.spyOn(console, 'error');
      const onUploadComplete = jest.fn();
      const { container, unmount } = render(<UploadInputV4 {...defaultProps} onUploadComplete={onUploadComplete} />);
      select(container, fileOf('sample.png', 11264, 'image/png'));
      await waitFor(() => expect(api.puts()).toHaveLength(1));

      unmount();

      await waitFor(() => expect(api.calls('DELETE', /.*/).map(r => r.path)).toEqual(['/uploads/t1']));
      expect(onUploadComplete).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });
});
