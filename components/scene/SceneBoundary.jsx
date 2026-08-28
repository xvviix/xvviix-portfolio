'use client';

import { Component } from 'react';


// Contains asset failures (e.g. a project texture that fails to download)
// so one broken chapter can never take down the rest of the scene.
// Unlike WebGLBoundary this renders nothing and keeps WebGL alive.
export class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[SceneBoundary] chapter skipped:', this.props.name, error?.message);
    }
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

/**
 * Keeps a chapter completely unmounted (zero geometry, zero shaders, zero
 * texture downloads) until the visitor approaches it, moving the heavy
 * mount spike away from initial load and into the middle of the journey.
 * The rAF probe self-destructs the moment the threshold is passed.
 */
