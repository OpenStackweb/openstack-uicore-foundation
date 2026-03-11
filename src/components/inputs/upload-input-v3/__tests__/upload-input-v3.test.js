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
import UploadInputV3 from '../index';
import { Box, Typography, Paper, IconButton, Button, Alert } from '@mui/material';

Enzyme.configure({ adapter: new Adapter() });

// Mock DropzoneJS component
jest.mock('../../upload-input-v2/dropzone', () => {
  return function MockDropzoneJS(props) {
    return <div className="dropzone-mock" data-upload-count={props.uploadCount}>Dropzone Component</div>;
  };
});

describe('UploadInputV3', () => {
  const defaultProps = {
    value: [],
    postUrl: 'https://example.com/upload',
    mediaType: {
      type: {
        allowed_extensions: ['pdf', 'jpg', 'png']
      },
      max_size: 1024000
    }
  };

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
  });

  describe('File Display', () => {
    test('displays uploaded files', () => {
      const files = [
        {
          filename: 'document.pdf',
          size: 102400,
          public_url: 'https://example.com/document.pdf'
        }
      ];
      const wrapper = shallow(<UploadInputV3 {...defaultProps} value={files} />);
      const papers = wrapper.find(Paper);
      expect(papers.length).toBe(1);

      const fileTypography = papers.first().findWhere(node =>
        node.type() === Typography && node.prop('fontWeight') === 500
      );
      expect(fileTypography.children().text()).toBe('document.pdf');
    });

    test('displays multiple uploaded files', () => {
      const files = [
        {
          filename: 'document1.pdf',
          size: 102400,
          public_url: 'https://example.com/document1.pdf'
        },
        {
          filename: 'document2.pdf',
          size: 204800,
          public_url: 'https://example.com/document2.pdf'
        }
      ];
      const wrapper = shallow(<UploadInputV3 {...defaultProps} value={files} maxFiles={2} />);
      const papers = wrapper.find(Paper);
      expect(papers.length).toBe(2);
    });

    test('formats file size correctly', () => {
      const files = [
        {
          filename: 'large-file.pdf',
          size: 2048000,
          public_url: 'https://example.com/large-file.pdf'
        }
      ];
      const wrapper = shallow(<UploadInputV3 {...defaultProps} value={files} />);
      const papers = wrapper.find(Paper);
      expect(papers.length).toBe(1);
      const sizeTypography = papers.first().find(Typography).filterWhere(n => n.prop('variant') === 'caption');
      expect(sizeTypography.length).toBe(1);
    });

    test('shows default size when size is not provided', () => {
      const files = [
        {
          filename: 'no-size.pdf',
          public_url: 'https://example.com/no-size.pdf'
        }
      ];
      const wrapper = shallow(<UploadInputV3 {...defaultProps} value={files} />);
      const papers = wrapper.find(Paper);
      expect(papers.length).toBe(1);
      const sizeTypography = papers.first().find(Typography).filterWhere(n => n.prop('variant') === 'caption');
      expect(sizeTypography.length).toBe(1);
    });
  });

  describe('Delete Functionality', () => {
    test('shows delete button when onRemove is provided and canDelete is true', () => {
      const files = [
        {
          filename: 'document.pdf',
          size: 102400,
          public_url: 'https://example.com/document.pdf'
        }
      ];
      const onRemoveMock = jest.fn();
      const wrapper = shallow(
        <UploadInputV3
          {...defaultProps}
          value={files}
          onRemove={onRemoveMock}
          canDelete={true}
        />
      );

      const deleteButtons = wrapper.find(IconButton);
      expect(deleteButtons.length).toBe(1);
    });

    test('calls onRemove when delete button is clicked', () => {
      const files = [
        {
          filename: 'document.pdf',
          size: 102400,
          public_url: 'https://example.com/document.pdf'
        }
      ];
      const onRemoveMock = jest.fn();
      const wrapper = shallow(
        <UploadInputV3
          {...defaultProps}
          value={files}
          onRemove={onRemoveMock}
          canDelete={true}
        />
      );

      const deleteButton = wrapper.find(IconButton).first();
      deleteButton.simulate('click', { preventDefault: () => {} });

      expect(onRemoveMock).toHaveBeenCalledWith(files[0]);
    });

    test('does not show delete button when canDelete is false', () => {
      const files = [
        {
          filename: 'document.pdf',
          size: 102400,
          public_url: 'https://example.com/document.pdf'
        }
      ];
      const onRemoveMock = jest.fn();
      const wrapper = shallow(
        <UploadInputV3
          {...defaultProps}
          value={files}
          onRemove={onRemoveMock}
          canDelete={false}
        />
      );

      const deleteButtons = wrapper.find(IconButton);
      expect(deleteButtons.length).toBe(0);
    });

    test('does not show delete button when onRemove is not provided', () => {
      const files = [
        {
          filename: 'document.pdf',
          size: 102400,
          public_url: 'https://example.com/document.pdf'
        }
      ];
      const wrapper = shallow(
        <UploadInputV3
          {...defaultProps}
          value={files}
          canDelete={true}
        />
      );

      const deleteButtons = wrapper.find(IconButton);
      expect(deleteButtons.length).toBe(0);
    });
  });

  describe('Upload States', () => {
    test('shows dropzone when can upload', () => {
      const wrapper = mount(<UploadInputV3 {...defaultProps} />);
      const dropzone = wrapper.find('.dropzone-mock');
      expect(dropzone.length).toBe(1);
      wrapper.unmount();
    });

    test('shows alert when postUrl is not provided', () => {
      const wrapper = shallow(<UploadInputV3 {...defaultProps} postUrl={null} />);
      const alert = wrapper.findWhere(node =>
        node.type() === Alert && node.prop('severity') === 'error'
      );
      expect(alert.length).toBe(1);
      expect(alert.children().text()).toBe('No Post URL');

      const dropzone = wrapper.find('.dropzone-mock');
      expect(dropzone.length).toBe(0);
    });

    test('shows alert when canAdd is false', () => {
      const wrapper = shallow(<UploadInputV3 {...defaultProps} canAdd={false} />);
      const alert = wrapper.findWhere(node =>
        node.type() === Alert && node.prop('severity') === 'warning'
      );
      expect(alert.length).toBe(1);
      expect(alert.children().text()).toBe('Upload has been disabled by administrators.');

      const dropzone = wrapper.find('.dropzone-mock');
      expect(dropzone.length).toBe(0);
    });

    test('shows button and files when max files reached', () => {
      const files = [
        {
          filename: 'document.pdf',
          size: 102400,
          public_url: 'https://example.com/document.pdf'
        }
      ];
      const wrapper = mount(<UploadInputV3 {...defaultProps} value={files} maxFiles={1} />);

      // Should show disabled button when max files reached
      const uploadButton = wrapper.find(Button);
      expect(uploadButton.length).toBe(1);
      expect(uploadButton.prop('disabled')).toBe(true);

      // Should not show dropzone
      const dropzone = wrapper.find('.dropzone-mock');
      expect(dropzone.length).toBe(0);

      // Should show the uploaded file
      const papers = wrapper.find(Paper);
      expect(papers.length).toBe(1);

      wrapper.unmount();
    });

    test('shows disabled upload button when cannot upload', () => {
      const files = [
        {
          filename: 'document.pdf',
          size: 102400,
          public_url: 'https://example.com/document.pdf'
        }
      ];
      const wrapper = shallow(<UploadInputV3 {...defaultProps} value={files} maxFiles={1} />);
      const uploadButton = wrapper.find(Button);
      expect(uploadButton.length).toBe(1);
      expect(uploadButton.prop('disabled')).toBe(true);
    });
  });

  describe('Configuration', () => {
    test('uses custom getAllowedExtensions function when provided', () => {
      const customGetExtensions = jest.fn(() => '.doc,.docx');
      shallow(
        <UploadInputV3
          {...defaultProps}
          getAllowedExtensions={customGetExtensions}
        />
      );
      expect(customGetExtensions).toHaveBeenCalled();
    });

    test('uses custom getMaxSize function when provided', () => {
      const customGetMaxSize = jest.fn(() => 500);
      shallow(
        <UploadInputV3
          {...defaultProps}
          getMaxSize={customGetMaxSize}
        />
      );
      expect(customGetMaxSize).toHaveBeenCalled();
    });

    test('handles multiple files configuration', () => {
      const files = [
        {
          filename: 'doc1.pdf',
          size: 102400,
          public_url: 'https://example.com/doc1.pdf'
        },
        {
          filename: 'doc2.pdf',
          size: 102400,
          public_url: 'https://example.com/doc2.pdf'
        }
      ];

      const wrapper = mount(
        <UploadInputV3
          {...defaultProps}
          value={files}
          maxFiles={3}
        />
      );

      const dropzone = wrapper.find('.dropzone-mock');
      expect(dropzone.length).toBe(1);

      const papers = wrapper.find(Paper);
      expect(papers.length).toBe(2);
      wrapper.unmount();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty value array', () => {
      const wrapper = mount(<UploadInputV3 {...defaultProps} value={[]} />);
      const dropzone = wrapper.find('.dropzone-mock');
      expect(dropzone.length).toBe(1);

      const papers = wrapper.find(Paper);
      expect(papers.length).toBe(0);
      wrapper.unmount();
    });

    test('handles mediaType without type property', () => {
      const propsWithoutType = {
        ...defaultProps,
        mediaType: { max_size: 1024000 }
      };
      const wrapper = mount(<UploadInputV3 {...propsWithoutType} />);
      const dropzone = wrapper.find('.dropzone-mock');
      expect(dropzone.length).toBe(1);
      wrapper.unmount();
    });

    test('handles missing mediaType', () => {
      const propsWithoutMediaType = {
        value: [],
        postUrl: 'https://example.com/upload'
      };
      const wrapper = mount(<UploadInputV3 {...propsWithoutMediaType} />);
      const dropzone = wrapper.find('.dropzone-mock');
      expect(dropzone.length).toBe(1);
      wrapper.unmount();
    });

    test('handles undefined value prop', () => {
      const propsWithUndefinedValue = {
        postUrl: 'https://example.com/upload',
        mediaType: defaultProps.mediaType
      };
      const wrapper = shallow(<UploadInputV3 {...propsWithUndefinedValue} />);
      expect(wrapper.find(Box).length).toBeGreaterThan(0);
    });
  });
});
