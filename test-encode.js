// Simple test to verify encoding/decoding works
const testObj = {
  id: "test-123",
  name: "Test JSM",
  raw: '{"start":"Pending","states":[{"name":"Pending"}]}',
  positions: { "Pending": { x: 100, y: 200 } },
  layoutAlgorithm: "grid",
  createdAt: Date.now(),
  updatedAt: Date.now()
};

// Encode
const json = JSON.stringify(testObj);
const utf8 = new TextEncoder().encode(json);
const binary = String.fromCharCode.apply(null, Array.from(utf8));
const encoded = btoa(binary);

console.log("Original:", json.substring(0, 50));
console.log("Encoded:", encoded.substring(0, 50));

// Decode
const decodedBinary = atob(encoded);
const decodedBytes = new Uint8Array(decodedBinary.length);
for (let i = 0; i < decodedBinary.length; i++) {
  decodedBytes[i] = decodedBinary.charCodeAt(i);
}
const decodedJson = new TextDecoder().decode(decodedBytes);
const decodedObj = JSON.parse(decodedJson);

console.log("Decoded name:", decodedObj.name);
console.log("Match:", JSON.stringify(testObj) === decodedJson);
