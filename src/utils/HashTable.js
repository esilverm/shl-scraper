const defaultHashTableSize = 32;

module.exports = class HashTable {
  /**
   * @param {number} size hash table size
   */
  constructor(size = defaultHashTableSize) {
    // Create a table of given or default size and fill with null
    this.buckets = Array(size).fill(null).map(() => new Array());

    // allows us to keep track of our keys for faster searching
    this.keys = {};
  }

  /**
   *  Converst string to hash number.
   *
   * @param {string} key
   * @return {number}
   */
  hash(key) {
    // adds up the char codes of each character in the key
    const hash = key.split('').reduce((acc, symbol) => acc + symbol.charCodeAt(0), 0);
    return hash % this.buckets.length;
  }

  /**
   *  Adds value to HashTable
   *
   * @param {string} key
   * @param {*} value what we will be putting in the table
   */
  set(key, value) {
    const keyHash = this.hash(key);
    this.keys[key] = keyHash;
    const bucketArray = this.buckets[keyHash];
    const node = bucketArray.filter(nodeVal => nodeVal.key === key);
    // if the node doesn't exist
    if (node.length === 0) {
      // add to hashtable
      bucketArray.push({key, value});
    } else {
      // update value of current node
      node[0].value = value; // node.value.value = value;
    }
  }

  /**
   *  Removes a value from the HashTable
   *
   * @param {string} key
   * @return {*} what has been removed
   */
  delete(key) {
    const keyhash = this.hash(key);
    delete this.keys[key];
    const bucketArray = this.buckets[keyHash];
    const node = bucketArray.filter(nodeVal => nodeVal.key === key);

    if (node.length > 0) {
      // remove value from array
      this.buckets[keyHash] = bucketArray.filter(nodeVal => nodeVal.key !== key);
      return node[0].value;
    }

    return null;
  }

  /**
   *  Gets a value from the HashTable
   *
   * @param {string} key
   * @return {*} the value we are looking for
   */
   get(key) {
     const bucketArray = this.buckets[this.hash(key)];
     const node = bucketArray.filter(nodeVal => nodeVal.key === key);

     return node.length > 0 ? node[0].value : undefined;
   }

   /**
    *  Returns if the current value is in the hashtable
    *
    * @param {string} key
    * @return {boolean}
    */
    has(key) {
      return Object.hasOwnProperty.call(this.keys, key);
    }

    /**
     * @return {string[]} all the keys
     */
     getKeys() {
       return Object.keys(this.keys);
     }
}
