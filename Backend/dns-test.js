const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.cluster0.nr4ptaq.mongodb.net",
  (err, addresses) => {
    if (err) {
      console.error(err);
    } else {
      console.log(addresses);
    }
  }
);