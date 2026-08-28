'use client';

import { Component } from 'react';

/**
 * Catches any failure thrown while mounting the WebGL canvas
 * (unsupported GPU, blocked driver, context creation error…).
 * When it fails, the `no-webgl` class is added to <html> so the
 * CSS fallback layout takes over: the site remains fully readable
 * and every button/form stays clickable without the 3D layer.
 */
export default class WebGLBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('no-webgl');
    }
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[WebGLBoundary] 3D scene disabled:', error);
    }
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
