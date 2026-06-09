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

import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressiveImg from '../index';

describe('ProgressiveImg', () => {
  describe('local src (dataURL / blob URL)', () => {
    test('renders dataURL immediately without placeholder or blur', () => {
      const dataURL = 'data:image/jpeg;base64,abc123';
      render(<ProgressiveImg src={dataURL} alt="test image" placeholderSrc="placeholder.png" />);
      const img = screen.getByRole('img', { name: 'test image' });
      expect(img).toHaveAttribute('src', dataURL);
      expect(img.className).toContain('loaded');
      expect(img.className).not.toContain('loading');
    });

    test('renders blob URL immediately without placeholder or blur', () => {
      const blobURL = 'blob:photo.jpg';
      render(<ProgressiveImg src={blobURL} alt="test image" placeholderSrc="placeholder.png" />);
      const img = screen.getByRole('img', { name: 'test image' });
      expect(img).toHaveAttribute('src', blobURL);
      expect(img.className).toContain('loaded');
      expect(img.className).not.toContain('loading');
    });

    test('updates immediately when src changes to a local URL', () => {
      const serverURL = 'https://cdn.example.com/photo.jpg';
      const blobURL = 'blob:photo.jpg';
      const { rerender } = render(<ProgressiveImg src={serverURL} alt="test image" placeholderSrc="placeholder.png" />);

      rerender(<ProgressiveImg src={blobURL} alt="test image" placeholderSrc="placeholder.png" />);

      const img = screen.getByRole('img', { name: 'test image' });
      expect(img).toHaveAttribute('src', blobURL);
      expect(img.className).toContain('loaded');
    });
  });

  describe('URL src', () => {
    let mockImageInstances;

    beforeEach(() => {
      mockImageInstances = [];
      global.Image = jest.fn().mockImplementation(() => {
        const instance = { src: '', onload: null, onerror: null };
        mockImageInstances.push(instance);
        return instance;
      });
    });

    afterEach(() => {
      delete global.Image;
    });

    test('renders placeholder initially while loading a URL', () => {
      render(<ProgressiveImg src="https://cdn.example.com/photo.jpg" alt="test" placeholderSrc="placeholder.png" />);
      const img = screen.getByRole('img', { name: 'test' });
      expect(img).toHaveAttribute('src', 'placeholder.png');
      expect(img.className).toContain('loading');
    });

    test('switches to actual src on successful load', () => {
      const src = 'https://cdn.example.com/photo.jpg';
      render(<ProgressiveImg src={src} alt="test" placeholderSrc="placeholder.png" />);
      act(() => { mockImageInstances[0].onload(); });
      const img = screen.getByRole('img', { name: 'test' });
      expect(img).toHaveAttribute('src', src);
      expect(img.className).toContain('loaded');
    });

    test('falls back to file_icon on error for unknown extension', () => {
      render(<ProgressiveImg src="https://cdn.example.com/photo.jpg" alt="test" />);
      act(() => { mockImageInstances[0].onerror(); });
      const img = screen.getByRole('img', { name: 'test' });
      expect(img.className).toContain('loaded');
      expect(img).not.toHaveAttribute('src', 'https://cdn.example.com/photo.jpg');
    });

    test('does not apply stale src when src changes before the first load completes', () => {
      const firstURL = 'https://cdn.example.com/slow.jpg';
      const secondURL = 'https://cdn.example.com/fast.jpg';
      const { rerender } = render(<ProgressiveImg src={firstURL} alt="test" placeholderSrc="placeholder.png" />);

      // Change src before firstURL loads — simulates the serverURL → dataURL swap in upload flow
      rerender(<ProgressiveImg src={secondURL} alt="test" placeholderSrc="placeholder.png" />);

      // Trigger the first (now-cancelled) effect's onload
      act(() => { mockImageInstances[0].onload(); });

      const img = screen.getByRole('img', { name: 'test' });
      expect(img).not.toHaveAttribute('src', firstURL);
    });
  });
});
