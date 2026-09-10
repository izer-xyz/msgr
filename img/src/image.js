export function validateDisplay(device) {
  const width = Number(device.width);
  const height = Number(device.height);
  const depth = Number(device.depth);

  if (
    !Number.isInteger(width) ||
    width <= 0 ||
    !Number.isInteger(height) ||
    height <= 0
  ) {
    throw new RangeError("Display dimensions must be positive integers");
  }

  if (![1, 2, 4, 8].includes(depth)) {
    throw new RangeError("Display depth must be 1, 2, 4, or 8");
  }

  return { width, height, depth };
}

export function greyscale(device, data) {
  const { width, height, depth } = validateDisplay(device);
  const size = width * height;
  const channels = data.length / size;

  if (!Number.isInteger(channels) || channels < 3) {
    throw new RangeError("Image data does not match display dimensions");
  }

  let out = new Uint8Array((size * depth) / 8);

  for (let i = 0; i < size; i++) {
    // let grey = 0.2126 * data[i * channels] + 0.7152 * data[i * channels + 1] + 0.0722 * data[i * channels + 2];
    let index = i * channels;
    let grey = (data[index] + data[index + 1] + data[index + 2]) / 3;
    out[Math.floor((i * depth) / 8)] |=
      (grey >> (8 - depth)) << (8 - depth * (1 + (i % (8 / depth))));
  }
  return out;
}