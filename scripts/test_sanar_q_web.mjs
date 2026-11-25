const res = await fetch('https://sanarmed.com/q/crianccedila-sexo-feminino-8-anos-de-idade-portadora-de-asma-comparece-agrave/', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
const text = await res.text();
const imgs = text.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp)/gi) || [];
console.log('Images in Sanar web page:', [...new Set(imgs)]);
