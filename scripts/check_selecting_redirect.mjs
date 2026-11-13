import https from 'https';

https.get('https://candidato.concursos.selecting.com.br/', res => {
  console.log(`Status: ${res.statusCode}, Location: ${res.headers.location}`);
});

