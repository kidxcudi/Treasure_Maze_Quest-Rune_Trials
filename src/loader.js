// src/core/loader.js
import * as THREE from 'three';
import { LoadingManager } from 'three';

export class AssetLoader {
  constructor() {
    this.assets = new Map();
    this.loadingManager = new LoadingManager();
    this.totalAssets = 0;
    this.loadedAssets = 0;
    this.progressCallbacks = [];
    this.errorCallbacks = [];

    // Configure loading manager callbacks
    this.loadingManager.onStart = () => this._dispatchProgress(0);
    this.loadingManager.onProgress = () => {
      this._dispatchProgress(this.loadedAssets / this.totalAssets);
    };
    this.loadingManager.onError = (url) => this._dispatchError(url);
  }

  /**
   * Load all game assets
   * @param {Object} manifest - Asset loading manifest 
   * @returns {Promise} Resolves when all assets are loaded
   */
  async load(manifest) {
    this.totalAssets = this._countAssets(manifest);
    this.loadedAssets = 0;

    const loadTasks = [];

    // Textures
    if (manifest.textures) {
      loadTasks.push(this._loadTextures(manifest.textures));
    }

    // Models
    if (manifest.models) {
      loadTasks.push(this._loadModels(manifest.models));
    }

    // Audio
    if (manifest.audio) {
      loadTasks.push(this._loadAudio(manifest.audio));
    }

    // Fonts
    if (manifest.fonts) {
      loadTasks.push(this._loadFonts(manifest.fonts));
    }

    // Other assets
    if (manifest.other) {
      loadTasks.push(this._loadOtherAssets(manifest.other));
    }

    return Promise.all(loadTasks);
  }

  /**
   * Register progress callback
   * @param {Function} callback - Called with progress (0-1)
   */
  onProgress(callback) {
    this.progressCallbacks.push(callback);
  }

  /**
   * Register error callback
   * @param {Function} callback - Called with error URL
   */
  onError(callback) {
    this.errorCallbacks.push(callback);
  }

  /**
   * Get loaded asset by key
   * @param {string} key 
   * @returns {*} Loaded asset
   */
  get(key) {
    return this.assets.get(key);
  }

  /**
   * Dispose all loaded assets
   */
  dispose() {
    this.assets.forEach(asset => {
      if (asset.dispose) asset.dispose();
      if (asset.texture) asset.texture.dispose();
    });
    this.assets.clear();
  }

  // Private methods
  _countAssets(manifest) {
    let count = 0;
    if (manifest.textures) count += Object.keys(manifest.textures).length;
    if (manifest.models) count += Object.keys(manifest.models).length;
    if (manifest.audio) count += Object.keys(manifest.audio).length;
    if (manifest.fonts) count += Object.keys(manifest.fonts).length;
    if (manifest.other) count += Object.keys(manifest.other).length;
    return count;
  }

  _dispatchProgress(progress) {
    this.progressCallbacks.forEach(cb => cb(progress));
  }

  _dispatchError(url) {
    this.errorCallbacks.forEach(cb => cb(url));
  }

  async _loadTextures(textures) {
    const loader = new THREE.TextureLoader(this.loadingManager);
    
    const promises = Object.entries(textures).map(([key, url]) => 
      new Promise((resolve) => {
        loader.load(url, (texture) => {
          this.assets.set(key, texture);
          this.loadedAssets++;
          resolve();
        });
      })
    );

    return Promise.all(promises);
  }

  async _loadModels(models) {
    const loader = new THREE.ObjectLoader(this.loadingManager);
    
    const promises = Object.entries(models).map(([key, url]) =>
      new Promise((resolve) => {
        loader.load(url, (model) => {
          this.assets.set(key, model);
          this.loadedAssets++;
          resolve();
        });
      })
    );

    return Promise.all(promises);
  }

  async _loadAudio(audioFiles) {
    const loader = new THREE.AudioLoader(this.loadingManager);
    
    const promises = Object.entries(audioFiles).map(([key, url]) =>
      new Promise((resolve) => {
        loader.load(url, (buffer) => {
          this.assets.set(key, buffer);
          this.loadedAssets++;
          resolve();
        });
      })
    );

    return Promise.all(promises);
  }

  async _loadFonts(fonts) {
    const loader = new THREE.FontLoader(this.loadingManager);
    
    const promises = Object.entries(fonts).map(([key, url]) =>
      new Promise((resolve) => {
        loader.load(url, (font) => {
          this.assets.set(key, font);
          this.loadedAssets++;
          resolve();
        });
      })
    );

    return Promise.all(promises);
  }

  async _loadOtherAssets(otherAssets) {
    const promises = Object.entries(otherAssets).map(([key, url]) =>
      new Promise((resolve) => {
        fetch(url)
          .then(response => {
            if (url.endsWith('.json')) return response.json();
            return response.blob();
          })
          .then(data => {
            this.assets.set(key, data);
            this.loadedAssets++;
            resolve();
          })
          .catch(() => this._dispatchError(url));
      })
    );

    return Promise.all(promises);
  }
}

// Singleton instance
export const assetLoader = new AssetLoader();