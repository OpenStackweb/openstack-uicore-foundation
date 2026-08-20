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
import { render } from '@testing-library/react';
import { DropzoneV3 } from '../dropzone-v3';

// Capture the eventHandlers bridged down to the underlying DropzoneJS
let capturedEventHandlers = null;

jest.mock('../../dropzone', () => ({
  __esModule: true,
  DropzoneJS: (props) => {
    capturedEventHandlers = props.eventHandlers;
    return null;
  }
}));

describe('DropzoneV3 - uploadprogress to React bridging', () => {
  beforeEach(() => {
    capturedEventHandlers = null;
  });

  const renderDropzoneV3 = (onUploadProgress) => render(
    <DropzoneV3
      id="test-dropzone-v3"
      config={{ postUrl: 'https://example.com/upload' }}
      djsConfig={{}}
      onUploadProgress={onUploadProgress}
    />
  );

  test('floors reported progress on file._completedBytes so a new chunk cannot stall or regress it', () => {
    const onUploadProgress = jest.fn();
    renderDropzoneV3(onUploadProgress);

    expect(capturedEventHandlers.uploadprogress).toBeDefined();

    // 6MB already completed via prior chunks (tracked on the file by dropzone/index.js's
    // xhr.onload handler) - a freshly-started chunk reports its own low bytesSent.
    const file = { size: 10000000, _completedBytes: 6000000 };
    capturedEventHandlers.uploadprogress(file, 0, 200000);

    // Raw bytesSent/file.size would report 2% here - the floor must report at least
    // what's actually been completed (60%), which is what the fix under test provides.
    expect(onUploadProgress).toHaveBeenCalledWith(file, 60);
  });

  test('caps reported progress at 100% even when completed bytes exceed file size', () => {
    const onUploadProgress = jest.fn();
    renderDropzoneV3(onUploadProgress);

    const file = { size: 3000000, _completedBytes: 4000000 };
    capturedEventHandlers.uploadprogress(file, 0, 5000000);

    expect(onUploadProgress).toHaveBeenCalledWith(file, 100);
  });

  test('reports 0 for a zero-size file without dividing by zero', () => {
    const onUploadProgress = jest.fn();
    renderDropzoneV3(onUploadProgress);

    const file = { size: 0 };
    capturedEventHandlers.uploadprogress(file, 0, 0);

    expect(onUploadProgress).toHaveBeenCalledWith(file, 0);
  });
});
