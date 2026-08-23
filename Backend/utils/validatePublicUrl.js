const dns = require("dns").promises;
const net = require("net");

function invalidUrl(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function isPrivateIp(address) {
  if (net.isIP(address) === 4) {
    const parts = address.split(".").map(Number);

    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      parts[0] === 0 ||
      (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
      (parts[0] === 169 && parts[1] === 254) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168)
    );
  }

  if (net.isIP(address) === 6) {
    const normalized = address.toLowerCase();
    return (
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:") ||
      normalized.startsWith("::ffff:127.") ||
      normalized.startsWith("::ffff:10.") ||
      normalized.startsWith("::ffff:192.168.")
    );
  }

  return true;
}

async function validatePublicUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw invalidUrl("A website URL is required.");
  }

  let parsed;

  try {
    parsed = new URL(value.trim());
  } catch {
    throw invalidUrl("Enter a valid http:// or https:// URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw invalidUrl("Only http:// and https:// URLs are allowed.");
  }

  if (parsed.username || parsed.password) {
    throw invalidUrl("Website URLs must not include credentials.");
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw invalidUrl("Local or internal website URLs are not allowed.");
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw invalidUrl("Private network website URLs are not allowed.");
    }

    return parsed.toString();
  }

  let addresses;

  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch {
    throw invalidUrl("The website hostname could not be resolved.");
  }

  if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) {
    throw invalidUrl("Private network website URLs are not allowed.");
  }

  return parsed.toString();
}

module.exports = validatePublicUrl;
