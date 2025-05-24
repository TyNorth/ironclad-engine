# Class: AssetLoader

Handles loading and storage of game assets.

**Source:** [core/AssetLoader.js, line 9](core/AssetLoader.js.html#line9)

---

## Constructor

### `new AssetLoader()`

Creates an instance of AssetLoader.

**Description:**
Handles loading and storage of game assets.

**Source:** [core/AssetLoader.js, line 9](core/AssetLoader.js.html#line9)

---

## Members

### `loadedCount`

**Type:** `number`

**Source:** [core/AssetLoader.js, line 20](core/AssetLoader.js.html#line20)

---

### `totalCountInCurrentBatch`

**Type:** `number`

**Source:** [core/AssetLoader.js, line 25](core/AssetLoader.js.html#line25)

---

## Methods

### `get(name)`

Retrieves a pre-loaded asset from the cache.

**Parameters:**
| Name | Type | Description |
|--------|--------|------------------------------------|
| `name` | `string` | The name/key of the asset to retrieve. |

**Returns:** `HTMLImageElement | object | AudioBuffer | undefined`
The cached asset, or undefined if not found.

**Source:** [core/AssetLoader.js, line 407](core/AssetLoader.js.html#line407)

---

### `getLoadingCount()`

Gets the current number of assets being loaded.

**Returns:** `number`

**Source:** [core/AssetLoader.js, line 439](core/AssetLoader.js.html#line439)

---

### `isDoneLoading()`

Checks if all assets currently being loaded have finished loading.

**Returns:** `boolean`
True if loadedCount is 0, false otherwise.

**Source:** [core/AssetLoader.js, line 431](core/AssetLoader.js.html#line431)

---

### `loadAll(batchId?)`

Starts loading all queued assets.

**Parameters:**
| Name | Type | Attributes | Default | Description |
|-----------|--------|------------|----------------|-----------------------------------------------------|
| `batchId` | `string` | optional | 'defaultBatch' | An optional identifier for this loading batch. |

**Returns:** `Promise<Map<string, any>>`
A promise that resolves with a map of successfully loaded assets in this batch, or rejects if any critical asset fails (though individual errors are also emitted).

**Source:** [core/AssetLoader.js, line 311](core/AssetLoader.js.html#line311)

---

### `queueAudio(name, path, group?)`

Queues an audio file for loading.

**Parameters:**
| Name | Type | Attributes | Default | Description |
|---------|--------|------------|----------|-----------------------------------------|
| `name` | `string` | | | A unique name to identify the asset. |
| `path` | `string` | | | The path to the audio file. |
| `group` | `string` | optional | 'global' | An optional group name for the asset. |

**Returns:** `this`

**Source:** [core/AssetLoader.js, line 97](core/AssetLoader.js.html#line97)

---

### `queueImage(name, path, group?)`

Queues an image for loading.

**Parameters:**
| Name | Type | Attributes | Default | Description |
|---------|--------|------------|----------|-----------------------------------------|
| `name` | `string` | | | A unique name to identify the asset. |
| `path` | `string` | | | The path to the image file. |
| `group` | `string` | optional | 'global' | An optional group name for the asset. |

**Returns:** `this`

**Source:** [core/AssetLoader.js, line 65](core/AssetLoader.js.html#line65)

---

### `queueJSON(name, path, group?)`

Queues a JSON file for loading.

**Parameters:**
| Name | Type | Attributes | Default | Description |
|---------|--------|------------|----------|-----------------------------------------|
| `name` | `string` | | | A unique name to identify the asset. |
| `path` | `string` | | | The path to the JSON file. |
| `group` | `string` | optional | 'global' | An optional group name for the asset. |

**Returns:** `this`

**Source:** [core/AssetLoader.js, line 81](core/AssetLoader.js.html#line81)
