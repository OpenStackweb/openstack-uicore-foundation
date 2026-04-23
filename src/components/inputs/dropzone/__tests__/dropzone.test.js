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
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { DropzoneJS } from '../index';

Enzyme.configure({ adapter: new Adapter() });

// Mock dependencies
jest.mock('../../../security/methods', () => ({
  getAccessToken: jest.fn(() => Promise.resolve('mock-token')),
  initLogOut: jest.fn()
}));

jest.mock('../../../../utils/crypto', () => ({
  getMD5: jest.fn(() => Promise.resolve('mock-md5-hash'))
}));

// Capture Dropzone options for inspection
let mockCapturedOptions = {};

jest.mock('dropzone', () => {
  return jest.fn().mockImplementation((element, options) => {
    mockCapturedOptions = options;
    return {
      options,
      on: jest.fn(),
      off: jest.fn(),
      destroy: jest.fn(() => null),
      getActiveFiles: jest.fn(() => [])
    };
  });
});

describe('DropzoneJS - HTTP 202 Polling UX', () => {
  let wrapper;
  let onUploadCompleteMock;
  let onErrorMock;

  const defaultProps = {
    id: 'test-dropzone',
    config: {
      postUrl: 'https://example.com/upload'
    },
    djsConfig: {
      chunking: true,
      maxFilesize: 100
    },
    eventHandlers: {},
    data: {},
    uploadCount: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCapturedOptions = {};
    onUploadCompleteMock = jest.fn();
    onErrorMock = jest.fn();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  /**
   * Test Case 1: chunksUploaded option should be defined (setup for fix)
   *
   * The fix requires overriding Dropzone's chunksUploaded option.
   * This test verifies the mechanism exists in the configuration.
   */
  test('test_dropzone_has_chunks_uploaded_option', (done) => {
    wrapper = mount(
      <DropzoneJS
        {...defaultProps}
        onUploadComplete={onUploadCompleteMock}
        onError={onErrorMock}
      />
    );

    setTimeout(() => {
      // Verify that chunksUploaded option is defined
      expect(mockCapturedOptions.chunksUploaded).toBeDefined();
      expect(typeof mockCapturedOptions.chunksUploaded).toBe('function');
      done();
    }, 10);
  });

  /**
   * Test Case 2: chunksUploaded should call done immediately when NO async processing flag
   *
   * Behavior Contract - Expected (for synchronous/200 uploads):
   * - When chunksUploaded is called for a file WITHOUT _asyncProcessing flag
   * - The done callback should be called immediately
   * - This allows Dropzone to fire the success event right away
   */
  test('test_dropzone_chunks_uploaded_calls_done_immediately_for_sync', (done) => {
    wrapper = mount(
      <DropzoneJS
        {...defaultProps}
        onUploadComplete={onUploadCompleteMock}
        onError={onErrorMock}
      />
    );

    setTimeout(() => {
      const mockFile = {
        name: 'test.pdf',
        size: 1024000
        // NO _asyncProcessing flag = synchronous upload (200 response)
      };

      const mockDone = jest.fn();

      // Call chunksUploaded
      if (mockCapturedOptions.chunksUploaded) {
        mockCapturedOptions.chunksUploaded(mockFile, mockDone);
      }

      // Verify done was called immediately
      expect(mockDone).toHaveBeenCalled();
      done();
    }, 10);
  });

  /**
   * Test Case 3: chunksUploaded should DEFER done when async processing flag is set
   *
   * Behavior Contract - Expected (for async/202 uploads):
   * - When chunksUploaded is called for a file WITH _asyncProcessing flag
   * - The done callback should NOT be called immediately
   * - Instead, it should be stored on the file object for later execution
   *
   * THIS TEST SHOULD FAIL INITIALLY (demonstrating the bug)
   */
  test('test_dropzone_202_response_should_not_fire_success_immediately', (done) => {
    wrapper = mount(
      <DropzoneJS
        {...defaultProps}
        onUploadComplete={onUploadCompleteMock}
        onError={onErrorMock}
      />
    );

    setTimeout(() => {
      const mockFile = {
        name: 'test.pdf',
        size: 1024000,
        _asyncProcessing: true  // This flag should defer success
      };

      const mockDone = jest.fn();

      // Call chunksUploaded
      if (mockCapturedOptions.chunksUploaded) {
        mockCapturedOptions.chunksUploaded(mockFile, mockDone);
      }

      // CRITICAL ASSERTION: done should NOT be called immediately for async processing
      // The bug is that the current code would call done() regardless of the flag
      expect(mockDone).not.toHaveBeenCalled();

      // Verify the done callback was stored on the file for later execution
      expect(mockFile._chunksUploadedDone).toBeDefined();
      expect(typeof mockFile._chunksUploadedDone).toBe('function');

      done();
    }, 10);
  });

  /**
   * Test Case 4: pollUploadStatus should call the stored done callback when complete
   *
   * After polling returns status: 'complete', the stored done callback
   * should be executed to allow Dropzone to fire the success event.
   */
  test('test_dropzone_202_polling_complete_fires_success', (done) => {
    // Mock fetch to return complete status
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          status: 'complete',
          name: 'test.pdf',
          size: 1024000
        })
      })
    );

    wrapper = mount(
      <DropzoneJS
        {...defaultProps}
        onUploadComplete={onUploadCompleteMock}
        onError={onErrorMock}
      />
    );

    setTimeout(() => {
      const mockFile = {
        name: 'test.pdf',
        size: 1024000,
        _asyncProcessing: true,
        _chunksUploadedDone: jest.fn()  // Simulate the stored done callback
      };

      // Get the component instance
      const instance = wrapper.instance();

      // Call pollUploadStatus (simulating the 202 response path)
      instance.pollUploadStatus('file-123', 'https://example.com/upload', mockFile);

      // Wait for polling interval (2000ms)
      setTimeout(() => {
        // Verify the stored done callback was called
        expect(mockFile._chunksUploadedDone).toHaveBeenCalled();

        // Verify onUploadComplete was also called
        expect(onUploadCompleteMock).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'complete' }),
          'test-dropzone',
          {}
        );

        done();
      }, 2500);
    }, 10);
  }, 10000);
});

describe('DropzoneJS - Progress Bar Monotonicity', () => {
  let wrapper;
  let capturedHandlers;

  const defaultProps = {
    id: 'test-dropzone',
    config: {
      postUrl: 'https://example.com/upload'
    },
    djsConfig: {
      chunking: true,
      chunkSize: 2000000,
      maxFilesize: 100
    },
    eventHandlers: {},
    data: {},
    uploadCount: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
    capturedHandlers = {};
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  /**
   * Test: Progress should never decrease during chunked uploads
   *
   * When parallel chunks are in flight, Dropzone fires uploadprogress
   * events with bytesSent values that can be lower than previously reported
   * (each chunk starts from 0). The fix tracks completed bytes and uses
   * them as a floor so progress never goes backwards.
   */
  test('test_dropzone_progress_never_decreases_during_chunked_upload', (done) => {
    // Override the mock to capture event handlers
    const DropzoneMock = require('dropzone');
    DropzoneMock.mockImplementation((element, options) => {
      return {
        options: { ...options, chunkSize: 2000000 },
        on: jest.fn((event, handler) => {
          capturedHandlers[event] = handler;
        }),
        off: jest.fn(),
        destroy: jest.fn(() => null),
        getActiveFiles: jest.fn(() => [])
      };
    });

    wrapper = mount(
      <DropzoneJS
        {...defaultProps}
        onUploadComplete={jest.fn()}
        onError={jest.fn()}
      />
    );

    setTimeout(() => {
      const uploadProgressHandler = capturedHandlers['uploadprogress'];
      expect(uploadProgressHandler).toBeDefined();

      // Create a mock file with a preview element to capture width updates
      const progressValues = [];
      const mockProgressElem = {
        style: {
          set width(val) {
            progressValues.push(parseFloat(val));
          },
          get width() {
            return progressValues.length > 0
              ? progressValues[progressValues.length - 1] + '%'
              : '0%';
          }
        }
      };

      const mockFile = {
        name: 'large-video.mp4',
        size: 10000000, // 10MB
        previewElement: {
          querySelectorAll: jest.fn(() => [mockProgressElem])
        }
      };

      // Simulate chunk upload progress events in realistic order:
      // Chunk 0 completes (2MB), Chunk 1 starts (reports low bytesSent)
      uploadProgressHandler(mockFile, 0, 500000);    // 500KB sent
      uploadProgressHandler(mockFile, 0, 1500000);   // 1.5MB sent
      uploadProgressHandler(mockFile, 0, 2000000);   // 2MB sent (chunk 0 done)

      // Simulate xhr.onload completing for chunk 0 — sets _completedBytes
      mockFile._completedBytes = 2000000;

      // New chunk starts - bytesSent resets to a low value
      uploadProgressHandler(mockFile, 0, 200000);    // 200KB of chunk 1
      uploadProgressHandler(mockFile, 0, 1000000);   // 1MB of chunk 1

      // Simulate another chunk completing
      mockFile._completedBytes = 4000000;

      // Another chunk starts with low bytesSent
      uploadProgressHandler(mockFile, 0, 100000);    // 100KB of chunk 2

      // Verify progress never decreases
      for (let i = 1; i < progressValues.length; i++) {
        expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
      }

      // Verify progress values are reasonable (first should be > 0, last should be > first)
      expect(progressValues.length).toBeGreaterThan(0);
      expect(progressValues[progressValues.length - 1]).toBeGreaterThan(progressValues[0]);

      done();
    }, 10);
  });

  /**
   * Test: Progress should never exceed 100%
   *
   * Even if _completedBytes exceeds file size (due to chunk size rounding),
   * progress should be capped at 100%.
   */
  test('test_dropzone_progress_capped_at_100_percent', (done) => {
    const DropzoneMock = require('dropzone');
    DropzoneMock.mockImplementation((element, options) => {
      return {
        options: { ...options, chunkSize: 2000000 },
        on: jest.fn((event, handler) => {
          capturedHandlers[event] = handler;
        }),
        off: jest.fn(),
        destroy: jest.fn(() => null),
        getActiveFiles: jest.fn(() => [])
      };
    });

    wrapper = mount(
      <DropzoneJS
        {...defaultProps}
        onUploadComplete={jest.fn()}
        onError={jest.fn()}
      />
    );

    setTimeout(() => {
      const uploadProgressHandler = capturedHandlers['uploadprogress'];
      expect(uploadProgressHandler).toBeDefined();

      const progressValues = [];
      const mockProgressElem = {
        style: {
          set width(val) {
            progressValues.push(parseFloat(val));
          },
          get width() {
            return '0%';
          }
        }
      };

      const mockFile = {
        name: 'small.pdf',
        size: 3000000, // 3MB - not a multiple of chunkSize (2MB)
        _completedBytes: 4000000, // Exceeds file size due to rounding
        previewElement: {
          querySelectorAll: jest.fn(() => [mockProgressElem])
        }
      };

      // bytesSent also exceeds file size
      uploadProgressHandler(mockFile, 0, 5000000);

      // Progress must be capped at 100%
      expect(progressValues.length).toBe(1);
      expect(progressValues[0]).toBe(100);

      done();
    }, 10);
  });
});
