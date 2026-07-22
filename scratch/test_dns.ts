import dns from 'dns';

dns.lookup('mdjckkbpbqmivatxdpcx.supabase.co', { family: 6 }, (err, address, family) => {
  console.log('lookup family 6 result:', { err, address, family });
});

dns.lookup('mdjckkbpbqmivatxdpcx.supabase.co', { verbatim: true }, (err, address, family) => {
  console.log('lookup verbatim true result:', { err, address, family });
});

dns.lookup('mdjckkbpbqmivatxdpcx.supabase.co', { verbatim: false }, (err, address, family) => {
  console.log('lookup verbatim false result:', { err, address, family });
});
