/**
 * Binds itself to an element and updates based on the value in the object.
 */
class DataElement {
  constructor (element, object, key) {
    this._element = element;
    this._object = object;
    this._key = key;
    this._prev = null;
  }

  update () {
    const value = this._object[this._key];
    if (this._prev !== value) {
      this._element.textContent = value;
      this._prev = value;
    }
  }
}

export default DataElement;
