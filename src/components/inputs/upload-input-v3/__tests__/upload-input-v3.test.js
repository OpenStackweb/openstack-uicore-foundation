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
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { act } from 'react-dom/test-utils';
import UploadInputV3 from '../index';
import { Box, Typography, IconButton, Alert } from '@mui/material';

Enzyme.configure({ adapter: new Adapter() });

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
      max_size: 1024000
    }
  };

  beforeEach(() => {
    dropzoneCallbacks = {};
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      const wrapper = shallow(<UploadInputV3 {...defaultProps} />);
      expect(wrapper.find(Box).length).toBeGreaterThan(0);
    });

    test('renders label when provided', () => {
      const wrapper = shallow(<UploadInputV3 {...defaultProps} label="Upload File" />);
      const label = wrapper.find(Typography).first();
      expect(label.children().text()).toBe('Upload File');
    });

    test('renders helpText when provided', () => {
      const helpText = 'Please upload PDF, JPG or PNG files';
      const wrapper = shallow(<UploadInputV3 {...defaultProps} helpText={helpText} />);
      const helpTypography = wrapper.findWhere(node =>
        node.type() === Typography && node.prop('color') === 'text.secondary'
      );
      expect(helpTypography.children().text()).toBe(helpText);
    });

    test('renders error message when error prop is provided', () => {
      const errorMessage = 'File upload failed';
      const wrapper = shallow(<UploadInputV3 {...defaultProps} error={errorMessage} />);
      const alert = wrapper.findWhere(node =>
        node.type() === Alert && node.prop('severity') === 'error'
      );
      expect(alert.length).toBe(1);
      expect(alert.children().text()).toBe(errorMessage);
    });

    test('does not render label when not provided', () => {
      const wrapper = shallow(<UploadInputV3 {...defaultProps} />);
      const labels = wrapper.findWhere(node =>
        node.type() === Typography && node.prop('fontWeight') === 600
      );
      expect(labels.length).toBe(0);
    });

    test('shows alert when postUrl is not provided', () => {
      const wrapper = shallow(<UploadInputV3 {...defaultProps} postUrl={null} />);
      const alert = wrapper.findWhere(node =>
        node.type() === Alert && node.prop('severity') === 'error'
      );
      expect(alert.length).toBe(1);
      expect(alert.children().text()).toBe('No Post URL');
    });

    test('shows alert when canAdd is false', () => {
      const wrapper = shallow(<UploadInputV3 {...defaultProps} canAdd={false} />);
      const alert = wrapper.findWhere(node =>
        node.type() === Alert && node.prop('severity') === 'warning'
      );
      expect(alert.length).toBe(1);
      expect(alert.children().text()).toBe('Upload has been disabled by administrators.');
    });
  });

  describe('File Display', () => {
    test('displays uploaded file with filename', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      const wrapper = mount(<UploadInputV3 {...defaultProps} value={files} />);
      expect(wrapper.text()).toContain('document.pdf');
      wrapper.unmount();
    });

    test('displays multiple uploaded files', () => {
      const files = [
        { filename: 'document1.pdf', size: 102400 },
        { filename: 'document2.pdf', size: 204800 },
      ];
      const wrapper = mount(<UploadInputV3 {...defaultProps} value={files} maxFiles={2} />);
      expect(wrapper.text()).toContain('document1.pdf');
      expect(wrapper.text()).toContain('document2.pdf');
      wrapper.unmount();
    });

    test('shows Complete status for uploaded files', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      const wrapper = mount(<UploadInputV3 {...defaultProps} value={files} />);
      expect(wrapper.text()).toContain('Complete');
      wrapper.unmount();
    });

    test('shows default size when size is not provided', () => {
      const files = [{ filename: 'no-size.pdf' }];
      const wrapper = mount(<UploadInputV3 {...defaultProps} value={files} />);
      expect(wrapper.text()).toContain('100kb');
      wrapper.unmount();
    });

    test('formats file size correctly', () => {
      const files = [{ filename: 'large-file.pdf', size: 2048000 }];
      const wrapper = mount(<UploadInputV3 {...defaultProps} value={files} />);
      expect(wrapper.text()).toContain('2000kb');
      wrapper.unmount();
    });
  });

  describe('Delete Functionality', () => {
    test('shows delete button when onRemove and canDelete are provided', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      const wrapper = shallow(
        <UploadInputV3 {...defaultProps} value={files} onRemove={jest.fn()} canDelete={true} />
      );
      expect(wrapper.find(IconButton).length).toBe(1);
    });

    test('calls onRemove when delete button is clicked', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      const onRemoveMock = jest.fn();
      const wrapper = shallow(
        <UploadInputV3 {...defaultProps} value={files} onRemove={onRemoveMock} canDelete={true} />
      );
      wrapper.find(IconButton).first().simulate('click', { preventDefault: () => {} });
      expect(onRemoveMock).toHaveBeenCalledWith(files[0]);
    });

    test('does not show delete button when canDelete is false', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      const wrapper = shallow(
        <UploadInputV3 {...defaultProps} value={files} onRemove={jest.fn()} canDelete={false} />
      );
      expect(wrapper.find(IconButton).length).toBe(0);
    });

    test('does not show delete button when onRemove is not provided', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      const wrapper = shallow(<UploadInputV3 {...defaultProps} value={files} canDelete={true} />);
      expect(wrapper.find(IconButton).length).toBe(0);
    });
  });

  describe('Upload States', () => {
    test('shows dropzone when no file is uploading', () => {
      const wrapper = mount(<UploadInputV3 {...defaultProps} />);
      expect(wrapper.find('.dropzone-mock').length).toBe(1);
      wrapper.unmount();
    });

    test('hides dropzone while a file is uploading', () => {
      const wrapper = mount(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onAddedFile({ name: 'sample.png', size: 11264 });
      });
      wrapper.update();
      const dropzoneBox = wrapper.findWhere(n =>
        n.type() === Box && n.prop('sx') && n.prop('sx').display === 'none'
      );
      expect(dropzoneBox.length).toBeGreaterThan(0);
      wrapper.unmount();
    });

    test('shows Loading status and progress bar while uploading', () => {
      const wrapper = mount(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onAddedFile({ name: 'sample.png', size: 11264 });
      });
      wrapper.update();
      expect(wrapper.text()).toContain('sample.png');
      expect(wrapper.text()).toContain('Loading');
      wrapper.unmount();
    });

    test('shows Complete status and hides progress bar after upload finishes', () => {
      const wrapper = mount(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onAddedFile({ name: 'sample.png', size: 11264 });
      });
      wrapper.update();
      act(() => {
        dropzoneCallbacks.onFileCompleted({ name: 'sample.png', size: 11264 });
      });
      wrapper.update();
      expect(wrapper.text()).toContain('Complete');
      expect(wrapper.text()).not.toContain('Loading');
      wrapper.unmount();
    });

    test('hides dropzone when max files reached', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      const wrapper = mount(<UploadInputV3 {...defaultProps} value={files} maxFiles={1} />);
      expect(wrapper.find('.dropzone-mock').length).toBe(0);
      wrapper.unmount();
    });

    test('shows dropzone when below max files', () => {
      const files = [{ filename: 'document.pdf', size: 102400 }];
      const wrapper = mount(<UploadInputV3 {...defaultProps} value={files} maxFiles={2} />);
      expect(wrapper.find('.dropzone-mock').length).toBe(1);
      wrapper.unmount();
    });
  });

  describe('Error Handling', () => {
    test('shows error row with filename and message when a file error occurs', () => {
      const wrapper = mount(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onAddedFile({ name: 'big-file.png', size: 9999999 });
      });
      wrapper.update();
      act(() => {
        dropzoneCallbacks.onFileError(
          { name: 'big-file.png', size: 9999999 },
          'File is too big (9.54MiB). Max filesize: 5MiB.'
        );
      });
      wrapper.update();
      expect(wrapper.text()).toContain('big-file.png');
      expect(wrapper.text()).toContain('File is too big (9.54MiB). Max filesize: 5MiB.');
      wrapper.unmount();
    });

    test('removes the uploading row and shows error row when error occurs', () => {
      const wrapper = mount(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onAddedFile({ name: 'big-file.png', size: 9999999 });
      });
      wrapper.update();
      expect(wrapper.text()).toContain('Loading');

      act(() => {
        dropzoneCallbacks.onFileError(
          { name: 'big-file.png', size: 9999999 },
          'File is too big (9.54MiB). Max filesize: 5MiB.'
        );
      });
      wrapper.update();
      expect(wrapper.text()).not.toContain('Loading');
      expect(wrapper.text()).toContain('File is too big');
      wrapper.unmount();
    });

    test('dismissing an error removes it from the view and restores the dropzone', () => {
      const wrapper = mount(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onFileError(
          { name: 'big-file.png', size: 9999999 },
          'File is too big (9.54MiB). Max filesize: 5MiB.'
        );
      });
      wrapper.update();
      expect(wrapper.text()).toContain('File is too big');

      const isDropzoneHidden = () => wrapper.findWhere(n =>
        n.type() === Box && n.prop('sx') && n.prop('sx').display === 'none'
      ).length > 0;
      expect(isDropzoneHidden()).toBe(true);

      const dismissButton = wrapper.findWhere(n =>
        n.type() === IconButton && n.prop('onClick') !== undefined
      ).first();
      act(() => {
        dismissButton.prop('onClick')();
      });
      wrapper.update();
      expect(wrapper.text()).not.toContain('File is too big');
      expect(isDropzoneHidden()).toBe(false);
      wrapper.unmount();
    });

    test('hides dropzone when an error is present', () => {
      const wrapper = mount(<UploadInputV3 {...defaultProps} />);
      act(() => {
        dropzoneCallbacks.onFileError(
          { name: 'big-file.png', size: 9999999 },
          'File is too big (9.54MiB). Max filesize: 5MiB.'
        );
      });
      wrapper.update();
      const dropzoneHidden = wrapper.findWhere(n =>
        n.type() === Box && n.prop('sx') && n.prop('sx').display === 'none'
      );
      expect(dropzoneHidden.length).toBeGreaterThan(0);
      wrapper.unmount();
    });
  });

  describe('Configuration', () => {
    test('uses custom getAllowedExtensions function when provided', () => {
      const customGetExtensions = jest.fn(() => '.doc,.docx');
      shallow(<UploadInputV3 {...defaultProps} getAllowedExtensions={customGetExtensions} />);
      expect(customGetExtensions).toHaveBeenCalled();
    });

    test('uses custom getMaxSize function when provided', () => {
      const customGetMaxSize = jest.fn(() => 500);
      shallow(<UploadInputV3 {...defaultProps} getMaxSize={customGetMaxSize} />);
      expect(customGetMaxSize).toHaveBeenCalled();
    });

    test('shows dropzone and all files when below max files limit', () => {
      const files = [
        { filename: 'doc1.pdf', size: 102400 },
        { filename: 'doc2.pdf', size: 102400 },
      ];
      const wrapper = mount(<UploadInputV3 {...defaultProps} value={files} maxFiles={3} />);
      expect(wrapper.find('.dropzone-mock').length).toBe(1);
      expect(wrapper.text()).toContain('doc1.pdf');
      expect(wrapper.text()).toContain('doc2.pdf');
      wrapper.unmount();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty value array', () => {
      const wrapper = mount(<UploadInputV3 {...defaultProps} value={[]} />);
      expect(wrapper.find('.dropzone-mock').length).toBe(1);
      wrapper.unmount();
    });

    test('handles mediaType without type property', () => {
      const wrapper = mount(<UploadInputV3 {...defaultProps} mediaType={{ max_size: 1024000 }} />);
      expect(wrapper.find('.dropzone-mock').length).toBe(1);
      wrapper.unmount();
    });

    test('handles missing mediaType', () => {
      const wrapper = mount(<UploadInputV3 value={[]} postUrl="https://example.com/upload" id="test" />);
      expect(wrapper.find('.dropzone-mock').length).toBe(1);
      wrapper.unmount();
    });

    test('handles undefined value prop', () => {
      const wrapper = shallow(<UploadInputV3 postUrl="https://example.com/upload" id="test" mediaType={defaultProps.mediaType} />);
      expect(wrapper.find(Box).length).toBeGreaterThan(0);
    });
  });
});
